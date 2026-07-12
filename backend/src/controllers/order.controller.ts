import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateTrackingId } from "../services/dhlSimulator"; // 👈 1. இங்கு இம்போர்ட் செய்யப்பட்டுள்ளது

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

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "❌ Cart is empty",
      });
    }

    const currency =
      (req as any).currency ||
      (req.query.currency as string) ||
      "USD";

    const rateData = await prisma.currencyRate.findUnique({
      where: {
        code: currency,
      },
    });

    if (!rateData) {
      return res.status(400).json({
        success: false,
        message: "Currency not found",
      });
    }

    let totalUSD = 0;
    const orderItemsData: any[] = [];

    // ===============================
    // CHECK STOCK + CALCULATE TOTAL
    // ===============================
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: {
          id: item.productVariantId,
        },
      });

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "❌ Product variant not found",
        });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `❌ Insufficient stock for ${variant.sku}`,
        });
      }

      const itemTotal = variant.price * item.quantity;

      totalUSD += itemTotal;

      orderItemsData.push({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: variant.price,
      });
    }

    // ===============================
    // TAX
    // ===============================
    const taxAmount = totalUSD * 0.18;

    const totalWithTax =
      totalUSD + taxAmount + Number(shippingCost);

    const finalTotal =
      totalWithTax * rateData.rate;

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

          exchangeRate: rateData.rate,

          taxAmount,

          shippingCost: Number(shippingCost),

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