import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🛒 ADD TO CART
export const addToCart = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const { productId, quantity } = req.body;

    // ✅ Product Check
    const product = await prisma.product.findUnique({
      where: {
        id: productId
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // ✅ Find Cart
    let cart = await prisma.cart.findUnique({
      where: {
        userId: user.userId
      }
    });

    // ✅ Create Cart
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.userId
        }
      });
    }

    // ✅ Existing Item Check
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId
      }
    });

    // ✅ Update Quantity
    if (existingItem) {
      await prisma.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: existingItem.quantity + quantity
        }
      });
    } else {
      // ✅ Create Item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: '🛒 Item added to cart'
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Cart add failed'
    });
  }
};


// 👀 VIEW CART
export const getCart = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const cart = await prisma.cart.findUnique({
      where: {
        userId: user.userId
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      cart
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};


// ❌ REMOVE ITEM
export const removeCartItem = async (
  req: Request,
  res: Response
) => {
  try {
    const { itemId } = req.params;

    // ✅ Check item exists
    const item = await prisma.cartItem.findUnique({
      where: {
        id: itemId
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // ✅ Delete item
    await prisma.cartItem.delete({
      where: {
        id: itemId
      }
    });

    return res.status(200).json({
      success: true,
      message: '🗑️ Item removed from cart'
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to remove item'
    });
  }
};


// 🔄 UPDATE QUANTITY
export const updateCartItemQuantity = async (
  req: Request,
  res: Response
) => {
  try {
    const { itemId } = req.params;

    const { quantity } = req.body;

    // ✅ Quantity validation
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // ✅ Check item exists
    const item = await prisma.cartItem.findUnique({
      where: {
        id: itemId
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // ✅ Update quantity
    await prisma.cartItem.update({
      where: {
        id: itemId
      },
      data: {
        quantity
      }
    });

    return res.status(200).json({
      success: true,
      message: '🔄 Cart quantity updated'
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update quantity'
    });
  }
};