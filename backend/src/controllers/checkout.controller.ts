import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { placeOrder } from "./order.controller";

const prisma = new PrismaClient();

// ======================================================
// 💳 பழைய /api/v1/checkout route
// இப்போது தனி கணக்கு இல்லை — Cart-ல் உள்ள items-ஐ எடுத்து
// புதிய placeOrder-க்கு (/orders/checkout) அனுப்புகிறது.
// அதனால் எல்லா வழிகளிலும் ஒரே கணக்கு, ஒரே விதிகள்.
// body: { addressId, paymentMethod?, currency?, couponCode? }
// ======================================================
export const checkout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    req.body = {
      ...req.body,
      items: cart.items.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      })),
    };

    return placeOrder(req, res);
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ success: false, message: "Checkout failed" });
  }
};