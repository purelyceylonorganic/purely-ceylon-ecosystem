import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// ===============================
// 🛒 ADD TO CART (VARIANT BASED)
// ===============================
export const addToCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { productVariantId, quantity } = req.body;

    if (!productVariantId) {
      return res.status(400).json({
        success: false,
        message: "productVariantId required"
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }

    // ✅ check variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId }
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found"
      });
    }

    // ✅ get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id }
      });
    }

    // ✅ check existing item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productVariantId
      }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productVariantId,
          quantity
        }
      });
    }

    return res.json({
      success: true,
      message: "🛒 Added to cart successfully"
    });

  } catch (error: any) {
    console.log("ADD TO CART ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Add to cart failed"
    });
  }
};


// ===============================
// 👀 GET CART (GLOBAL CURRENCY)
// ===============================
export const getCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // 🌍 currency from middleware OR query OR default
    const currency =
      (req as any).currency ||
      (req.query.currency as string) ||
      "USD";

    // 📦 get cart with VARIANT relation (IMPORTANT FIX)
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            productVariant: true   // 🔥 THIS IS THE FIX
          }
        }
      }
    });

    if (!cart) {
      return res.json({
        success: true,
        currency,
        items: [],
        totalUSD: 0,
        totalConverted: 0
      });
    }

    // 💱 get currency rate
    const rateData = await prisma.currencyRate.findUnique({
      where: { code: currency }
    });

    if (!rateData) {
      return res.status(400).json({
        success: false,
        message: "Currency not found"
      });
    }

    let totalUSD = 0;

    // 🧠 FIXED TYPE ISSUE HERE ALSO
    const items = cart.items.map((item: any) => {
      const price = item.productVariant.price; // 🔥 variant price
      const quantity = item.quantity;

      const itemTotal = price * quantity;
      totalUSD += itemTotal;

      return {
        variantId: item.productVariant.id,
        sku: item.productVariant.sku,
        weight: item.productVariant.weight,
        priceUSD: price,
        quantity,
        itemTotalUSD: itemTotal
      };
    });

    const totalConverted = totalUSD * rateData.rate;

    return res.json({
      success: true,
      currency,
      items,
      totalUSD,
      totalConverted
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cart error"
    });
  }
};


// ===============================
// ❌ REMOVE ITEM
// ===============================
export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { itemId } = req.params;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    if (item.cart.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    return res.json({
      success: true,
      message: "🗑️ Item removed"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Remove failed"
    });
  }
};


// ===============================
// 🔄 UPDATE QUANTITY
// ===============================
export const updateCartItemQuantity = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    if (item.cart.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });

    return res.json({
      success: true,
      message: "🔄 Updated"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Update failed"
    });
  }
};