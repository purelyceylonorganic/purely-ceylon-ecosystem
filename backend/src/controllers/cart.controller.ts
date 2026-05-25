import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🛒 Add To Cart
export const addToCart = async (
  req: any,
  res: Response
) => {
  try {

    const userId = req.user.userId;

    const { productId, quantity } = req.body;

    // Product check
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Find cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    // Create cart if not exists
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
      });
    }

    // Existing item check
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {

      await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });

    } else {

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });

    }

    return res.json({
      success: true,
      message: '🛒 Item added to cart',
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to add to cart',
    });

  }
};