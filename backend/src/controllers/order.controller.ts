import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateTrackingId } from "../services/dhlSimulator"; 
import { calculateCheckoutPricing } from "../services/checkoutPricing.service";
import { createAdminOrder, 
addProductToOrder, 
getOrderDetails,
updateOrderItemQuantity,
removeProductFromOrder,
confirmOrder, } from "../services/order.service";

const prisma = new PrismaClient();

// ===============================
// 🚀 PLACE ORDER
// ===============================
export const placeOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const {
      items,
      addressId,
      paymentMethod,
      shippingCost = 0,
    } = req.body;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "❌ Unauthorized user",
      });
    }

   
if (!addressId) {
  return res.status(400).json({
    success: false,
    message: "Delivery address is required",
  });
}

const address = await prisma.address.findFirst({
  where: {
    id: addressId,
    userId: user.id,
  },
});

if (!address) {
  return res.status(400).json({
    success: false,
    message: "Valid delivery address not found",
  });
}

const pricingVariants = [];

for (const item of items) {
  const quantity = Number(item.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid product quantity",
    });
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: item.productVariantId },
  });

  if (!variant) {
    return res.status(404).json({
      success: false,
      message: "Product variant not found",
    });
  }

  if (variant.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock for ${variant.sku}`,
    });
  }

  pricingVariants.push({
    id: variant.id,
    price: variant.price,
    priceLKR: variant.priceLKR,
    quantity,
  });
}

let pricing;

try {
  pricing = await calculateCheckoutPricing(
    address.country,
    pricingVariants
  );
} catch (error) {
  return res.status(400).json({
    success: false,
    message:
      error instanceof Error
        ? error.message
        : "Unable to calculate checkout totals",
  });
}

const {
  currency,
  exchangeRate,
  subtotalUSD: totalUSD,
  taxAmount,
  shippingCost: calculatedShippingCost,
  totalFinal: finalTotal,
  orderItems: orderItemsData,
} = pricing;

    // ===============================
    // TRANSACTION
    // ===============================
    const newOrder = await prisma.$transaction(async (tx: any) => {
      // Reduce Stock
      for (const item of items) {
        await tx.productVariant.update({
          where: {
            id: item.productVariantId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          userId: user.id,

          addressId,

          totalUSD,
currency,
exchangeRate,
taxAmount,
shippingCost: calculatedShippingCost,
totalFinal: finalTotal,

          trackingId: generateTrackingId(), // 👈 2. டிராக்கிங் ஐடி இங்கே இணைக்கப்பட்டுள்ளது

          shippingStatus: "PENDING",        // 👈 3. ஷிப்பிங் ஸ்டேட்டஸ் இங்கே இணைக்கப்பட்டுள்ளது

          paymentMethod,

          status: "PENDING",

          paymentStatus:
            paymentMethod === "COD"
              ? "UNPAID"
              : "PAID",

          items: {
            create: orderItemsData,
          },
        },

        include: {
          items: {
            include: {
              productVariant: true,
            },
          },
        },
      });

      // ✅ Clear Cart
      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId: user.id,
          },
        },
      });

      return order;
    });

    return res.status(201).json({
      success: true,
      message: "✅ Order placed successfully",
      order: newOrder,
    });

  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "❌ Failed to place order",
      error: error.message,
    });
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
        items: {
          include: {
            productVariant: true,
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
        user: true,
        address: true,
        items: true,
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