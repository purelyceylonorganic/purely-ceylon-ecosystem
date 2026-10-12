
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { calculateCheckoutPricing } from "../services/checkoutPricing.service";

const prisma = new PrismaClient();

export const checkout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { addressId, paymentMethod = "COD" } = req.body;

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

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: { productVariant: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const variants = cart.items.map((item) => ({
      id: item.productVariant.id,
      price: item.productVariant.price,
      priceLKR: item.productVariant.priceLKR,
      quantity: item.quantity,
    }));

    let pricing;

    try {
      pricing = await calculateCheckoutPricing(
        address.country,
        variants
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

    const order = await prisma.$transaction(async (tx) => {
      // Re-check and reduce stock inside the transaction.
      for (const item of cart.items) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.productVariantId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          throw new Error(
            `Insufficient stock for ${item.productVariant.sku}`
          );
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          addressId,
          currency: pricing.currency,
          exchangeRate: pricing.exchangeRate,
          totalUSD: pricing.subtotalUSD,
          taxAmount: pricing.taxAmount,
          shippingCost: pricing.shippingCost,
          totalFinal: pricing.totalFinal,
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "UNPAID" : "UNPAID",
          status: "PENDING",
          shippingStatus: "PENDING",
          trackingId: undefined,
          items: {
            create: pricing.orderItems,
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    return res.status(201).json({
      success: true,
      message: "Checkout successful",
      order,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      success: false,
      message: "Checkout failed",
    });
  }
};
