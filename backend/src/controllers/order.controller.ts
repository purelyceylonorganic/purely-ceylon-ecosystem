import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateTrackingId } from "../services/dhlSimulator"; 
import {
  calculateCheckoutPricing,
  pickCurrencyForCountry,
  SUPPORTED_CURRENCIES,
  type Currency,
} from "../services/checkoutPricing.service";
import { createAdminOrder, 
addProductToOrder, 
getOrderDetails,
updateOrderItemQuantity,
removeProductFromOrder,
confirmOrder, } from "../services/order.service";

const prisma = new PrismaClient();

// ===============================
// 🧰 உதவி: HTTP பிழை வகை
// ===============================
class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ===============================
// 🧾 PRICING (Preview-ம் Place Order-ம் இதையே பயன்படுத்தும்)
// ===============================
async function buildPricing(userId: string, body: any) {
  const { items, addressId, couponCode } = body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }
  if (!addressId) {
    throw new ApiError(400, "Delivery address is required");
  }

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) {
    throw new ApiError(400, "Valid delivery address not found");
  }

  // Currency: frontend அனுப்பினால் அதை எடுக்கும்; இல்லையென்றால் முகவரியின் நாட்டைப் பார்க்கும்
  const requested = String(body.currency || "").toUpperCase();
  const currency: Currency = SUPPORTED_CURRENCIES.includes(requested as Currency)
    ? (requested as Currency)
    : pickCurrencyForCountry(address.country);

  // Variants-ஐ ஒரே query-ல் எடுக்கிறோம்
  const ids = items.map((i: any) => i.productVariantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: ids } },
    include: { product: { select: { name: true, isActive: true, deletedAt: true } } },
  });

  const pricingVariants = items.map((item: any) => {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(400, "Invalid product quantity");
    }

    const variant = variants.find((v) => v.id === item.productVariantId);
    if (!variant) {
      throw new ApiError(404, "Product variant not found");
    }
    if (!variant.product.isActive || variant.product.deletedAt) {
      throw new ApiError(400, `${variant.product.name} is no longer available`);
    }
    if (variant.stock < quantity) {
      throw new ApiError(400, `Insufficient stock for ${variant.product.name} (${variant.weight})`);
    }

    return {
      id: variant.id,
      sku: variant.sku,
      weight: variant.weight,
      productName: variant.product.name,
      price: variant.price,
      priceLKR: variant.priceLKR,
      costPrice: variant.costPrice,
      quantity,
    };
  });

  try {
    const pricing = await calculateCheckoutPricing({
      country: address.country,
      province: address.province,
      currency,
      userId,
      couponCode,
      variants: pricingVariants,
    });
    return { pricing, address };
  } catch (error) {
    throw new ApiError(
      400,
      error instanceof Error ? error.message : "Unable to calculate checkout totals"
    );
  }
}

function sendError(res: Response, error: any, fallback: string) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: fallback, error: error?.message });
}

// ===============================
// 👀 CHECKOUT PREVIEW (Order உருவாக்காமல் மொத்தத்தை மட்டும் காட்டும்)
// ===============================
export const previewCheckout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    const { pricing } = await buildPricing(user.id, req.body);

    // orderItems உள் தரவு; வாடிக்கையாளருக்கு costPrice போகக்கூடாது
    const { orderItems, couponId, ...safe } = pricing;
    return res.json({
      success: true,
      pricing: {
        ...safe,
        items: orderItems.map(({ costPriceLKR, ...item }) => item),
      },
    });
  } catch (error) {
    return sendError(res, error, "Failed to calculate checkout");
  }
};

// ===============================
// 🚀 PLACE ORDER
// ===============================
export const placeOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "❌ Unauthorized user",
      });
    }

    const { paymentMethod = "COD" } = req.body;

    // ⚠️ விலை, shipping, tax எதையும் frontend-இலிருந்து நம்புவதில்லை — server-ல் கணக்கிடுகிறோம்
    const { pricing, address } = await buildPricing(user.id, req.body);

    const newOrder = await prisma.$transaction(async (tx) => {
      // 1) Stock குறைத்தல் (போதுமான stock இல்லையென்றால் நிறுத்தும்)
      for (const item of pricing.orderItems) {
        const result = await tx.productVariant.updateMany({
          where: { id: item.productVariantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new ApiError(400, `Insufficient stock for ${item.productName} (${item.variantLabel})`);
        }
      }

      // 2) Order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          addressId: address.id,

          currency: pricing.currency,
          exchangeRate: pricing.exchangeRate,
          subtotal: pricing.subtotal,
          discountAmount: pricing.discountAmount,
          couponCode: pricing.couponCode,
          taxAmount: pricing.taxAmount,
          shippingCost: pricing.shippingCost,
          totalFinal: pricing.totalFinal,
          totalUSD: pricing.totalUSD,
          balance: pricing.totalFinal,

          trackingId: generateTrackingId(),
          shippingStatus: "PENDING",
          status: "PENDING",
          paymentMethod,

          // ✅ பணம் உண்மையாக வந்த பிறகுதான் PAID (payment service அதைச் செய்யும்)
          paymentStatus: "UNPAID",

          shippingAddressSnapshot: {
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            province: address.province,
            postalCode: address.postalCode,
            country: address.country,
          },

          items: { create: pricing.orderItems },
        },
        include: { items: true },
      });

      // 3) Coupon பயன்பாடு பதிவு
      if (pricing.couponId) {
        await tx.coupon.update({
          where: { id: pricing.couponId },
          data: { usedCount: { increment: 1 } },
        });
        await tx.couponUsage.create({
          data: { userId: user.id, couponId: pricing.couponId, orderId: order.id },
        });
      }

      // 4) Cart காலி
      await tx.cartItem.deleteMany({ where: { cart: { userId: user.id } } });

      return order;
    });

    return res.status(201).json({
      success: true,
      message: "✅ Order placed successfully",
      order: newOrder,
    });
  } catch (error: any) {
    return sendError(res, error, "❌ Failed to place order");
  }
};

// ===============================
// GET MY ORDERS
// ===============================
export const getMyOrders = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

   
const orders = await prisma.order.findMany({
  where: {
    userId: user.id,
  },
  include: {
    address: true,
    items: {
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});


    return res.json({
      success: true,
      orders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get orders",
    });
  }
};

// ===============================
// GET SINGLE ORDER
// ===============================
export const getSingleOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id,
      },

      include: {
        address: true,

        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "❌ Order not found",
      });
    }

    return res.json({
      success: true,
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const updateOrderStatusController = async (
  req: Request,
  res: Response
) => {
  try {

    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return res.json({
      success: true,
      message: "Order status updated",
      order,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response
) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        address: true,
        items: {
          include: {
            productVariant: {
              select: { sku: true, weight: true, product: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const updateShippingController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      shippingStatus,
      trackingId,
    } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        shippingStatus,
        trackingId,
      },
    });

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shipping",
    });
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response
) => {
  try {
    // 1. மொத்த ஆர்டர்களின் எண்ணிக்கை
    const totalOrders = await prisma.order.count();

    // 2. மொத்த வாடிக்கையாளர்களின் எண்ணிக்கை
    const totalCustomers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    });

    // 3. பணம் செலுத்தப்பட்ட (PAID) ஆர்டர்களின் மொத்த வருவாய்
    const revenue = await prisma.order.aggregate({
      _sum: {
        totalFinal: true,
      },
      where: {
        paymentStatus: "PAID",
      },
    });

    // 4. காத்திருப்பிலுள்ள (PENDING) ஆர்டர்களின் எண்ணிக்கை
    const pendingOrders = await prisma.order.count({
      where: {
        status: "PENDING",
      },
    });

    // 5. டெலிவரி செய்யப்பட்ட (DELIVERED) ஆர்டர்களின் எண்ணிக்கை
    const deliveredOrders = await prisma.order.count({
      where: {
        status: "DELIVERED",
      },
    });

    // 6. Return Data
    return res.json({
      success: true,
      stats: {
        totalOrders,
        totalCustomers,
        totalRevenue: revenue._sum.totalFinal || 0,
        pendingOrders,
        deliveredOrders,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Dashboard stats failed",
    });
  }
};

export const createAdminOrderController = async (
  req: Request,
  res: Response
) => {
  try {
    const { customerId, addressId } = req.body;

    if (!customerId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "customerId and addressId are required",
      });
    }

    const order = await createAdminOrder(customerId, addressId);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const addProductToOrderController = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderId, productVariantId, quantity } = req.body;

    if (!orderId || !productVariantId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "orderId, productVariantId and quantity are required",
      });
    }

    const item = await addProductToOrder(
      orderId,
      productVariantId,
      Number(quantity)
    );

    return res.status(201).json({
      success: true,
      message: "Product added to order",
      data: item,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderId } = req.params;

    const order = await getOrderDetails(orderId);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderItemQuantityController = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderItemId, quantity } = req.body;

    if (!orderItemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "orderItemId and quantity are required",
      });
    }

    const order = await updateOrderItemQuantity(
      orderItemId,
      Number(quantity)
    );

    return res.status(200).json({
      success: true,
      message: "Order item quantity updated successfully",
      data: order,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeProductFromOrderController = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderItemId } = req.body;

    if (!orderItemId) {
      return res.status(400).json({
        success: false,
        message: "orderItemId is required",
      });
    }

    const order = await removeProductFromOrder(orderItemId);

    return res.status(200).json({
      success: true,
      message: "Product removed successfully",
      data: order,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const confirmOrderController = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const order = await confirmOrder(orderId);

    return res.status(200).json({
      success: true,
      message: "Order confirmed successfully",
      data: order,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};