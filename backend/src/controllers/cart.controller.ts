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
// 👀 GET CART (ஒரே currency, தெளிவான field பெயர்கள்)
// ===============================
export const getCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Frontend ?currency=LKR அல்லது USD என்று அனுப்பும். இல்லையென்றால் LKR.
    const requested = String(req.query.currency || "LKR").toUpperCase();
    const currency = requested === "USD" ? "USD" : "LKR";
    const isLKR = currency === "LKR";

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            productVariant: { include: { product: { include: { images: true } } } },
          },
        },
      },
    });

    let subtotal = 0;
    let totalUSD = 0;

    const items = (cart?.items ?? []).map((item: any) => {
      const variant = item.productVariant;
      const quantity = item.quantity;

      const unitPrice = Number(isLKR ? variant.priceLKR : variant.price);
      // விலை இல்லாத product cart-ஐ உடைக்காது; "available: false" என்று குறிக்கப்படும்
      const available = Number.isFinite(unitPrice) && unitPrice > 0;
      const itemTotal = available ? unitPrice * quantity : 0;

      subtotal += itemTotal;
      totalUSD += Number(variant.price) * quantity;

      return {
        id: item.id,
        variantId: variant.id,
        productName: variant.product.name,
        image: variant.product.images.length > 0 ? variant.product.images[0].url : null,
        sku: variant.sku,
        weight: variant.weight,
        quantity,

        // ✅ புதிய தெளிவான fields
        unitPrice,
        itemTotal,
        available,

        // ⏳ பழைய பெயர்கள் — பழைய frontend உடையாமல் இருக்க (Cart/Checkout பக்கங்களை மாற்றிய பிறகு நீக்கலாம்)
        priceUSD: unitPrice,
        itemTotalUSD: itemTotal,
      };
    });

    return res.json({
      success: true,
      currency,
      items,
      subtotal,
      allAvailable: items.every((i: any) => i.available),

      // ⏳ பழைய பெயர்கள்
      totalUSD,
      totalConverted: subtotal,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Cart error" });
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