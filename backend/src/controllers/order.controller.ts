import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// ===============================
// 🚀 PLACE ORDER (FINAL VERSION)
// ===============================
export const placeOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const {
      items,
      addressId,
      paymentMethod,
      shippingCost = 0
    } = req.body;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "❌ Unauthorized user"
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "❌ Cart is empty"
      });
    }
    const currency =
  (req as any).currency ||
  (req.query.currency as string) ||
  "USD";

const rateData = await prisma.currencyRate.findUnique({
  where: {
    code: currency
  }
});

if (!rateData) {
  return res.status(400).json({
    success: false,
    message: "Currency not found"
  });
}

    let totalUSD = 0;

    const orderItemsData: any[] = [];

    // ===============================
    // 🧠 CHECK STOCK + CALCULATE TOTAL
    // ===============================
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId }
      });

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "❌ Product variant not found"
        });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `❌ Insufficient stock for ${variant.sku}`
        });
      }

      const itemTotal = variant.price * item.quantity;
      totalUSD += itemTotal;

      orderItemsData.push({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: variant.price
      });
    }

    // ===============================
    // 🇱🇰 TAX SYSTEM (Sri Lanka VAT)
    // ===============================
    const taxAmount = totalUSD * 0.18;

    const totalWithTax =
  totalUSD + taxAmount + Number(shippingCost);

const finalTotal =
  totalWithTax * rateData.rate;

    // ===============================
    // 🚀 TRANSACTION (SAFE ORDER)
    // ===============================
    const newOrder = await prisma.$transaction(async (tx) => {

      // 1. reduce stock
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // 2. create order
      return await tx.order.create({
        data: {
  userId: user.id,

  addressId,

  totalUSD,

  currency,

  exchangeRate: rateData.rate,

  taxAmount,

  shippingCost: Number(shippingCost),

  totalFinal: finalTotal,

  paymentMethod,

  status: "PENDING",

  paymentStatus:
    paymentMethod === "COD"
      ? "UNPAID"
      : "PAID",

  items: {
    create: orderItemsData
  }
},
        include: {
          items: {
            include: {
              productVariant: true
            }
          }
        }
      });
    });

    return res.status(201).json({
      success: true,
      message: "✅ Order placed successfully",
      order: newOrder
    });

  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "❌ Failed to place order",
      error: error.message
    });
  }
};


// ===============================
// 📦 GET MY ORDERS
// ===============================
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            productVariant: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({
      success: true,
      orders
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get orders"
    });
  }
};


// ===============================
// 📦 GET SINGLE ORDER
// ===============================
export const getSingleOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        items: {
          include: {
            productVariant: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "❌ Order not found"
      });
    }

    return res.json({
      success: true,
      order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });
  }
};