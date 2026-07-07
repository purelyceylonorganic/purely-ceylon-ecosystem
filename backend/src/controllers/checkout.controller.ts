import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // 🌍 currency (middleware + query + default)
    const currency =
      (req as any).currency ||
      (req.query.currency as string) ||
      "USD";

    // =========================
    // 1. GET CART (VARIANT BASED)
    // =========================
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            productVariant: true
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "🛒 Cart is empty"
      });
    }

    // =========================
    // 2. GET CURRENCY RATE
    // =========================
    const rateData = await prisma.currencyRate.findUnique({
      where: { code: currency }
    });

    if (!rateData) {
      return res.status(400).json({
        success: false,
        message: "Currency not found"
      });
    }

    // =========================
    // 3. CALCULATE TOTALS
    // =========================
    let totalUSD = 0;

    const orderItems = cart.items.map((item: any) => {
      const price = item.productVariant.price;
      const quantity = item.quantity;

      const itemTotal = price * quantity;
      totalUSD += itemTotal;

      return {
        productVariantId: item.productVariant.id,
        quantity,
        price
      };
    });

    // =========================
    // 4. TAX + SHIPPING (SRI LANKA STYLE)
    // =========================
    const taxAmount = totalUSD * 0.05; // 5% VAT
    const shippingCost = 500;

    const subtotal = totalUSD + taxAmount + shippingCost;

    const totalFinal = subtotal * rateData.rate;

    // =========================
    // 5. CREATE ORDER (LOCKED CURRENCY)
    // =========================
    const order = await prisma.order.create({
      data: {
        userId: user.id,

        totalUSD,
        currency,
        exchangeRate: rateData.rate,
        totalFinal,

        taxAmount,
        shippingCost,

        paymentMethod: "COD",

        items: {
          create: orderItems
        }
      },
      include: {
        items: true
      }
    });

    // =========================
    // 6. CLEAR CART
    // =========================
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // =========================
    // 7. RESPONSE
    // =========================
    return res.status(201).json({
      success: true,
      message: "✅ Checkout successful",
      order
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "❌ Checkout failed"
    });
  }
};