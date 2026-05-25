import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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