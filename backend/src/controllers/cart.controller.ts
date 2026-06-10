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

    // 🔍 Debug User Check
    const existingUser = await prisma.user.findUnique({
      where: {
        id: user.userId
      }
    });

    console.log('Existing User:', existingUser);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    const { productId, quantity } = req.body;

    // rest of your code...

    // ✅ Validate Quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // ✅ Check Product Exists
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

    // ✅ Find User Cart
    let cart = await prisma.cart.findUnique({
      where: {
        userId: user.userId
      }
    });

    // ✅ Create Cart If Not Exists
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.userId
        }
      });
    }

    // ✅ Check Existing Cart Item
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

      // ✅ Create New Cart Item
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



// 👀 GET CART
export const getCart = async (
  req: Request,
  res: Response
) => {
  try {

    const user = (req as any).user;

    // ✅ Find Cart
    let cart = await prisma.cart.findUnique({
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

    // ✅ Create Empty Cart If Not Exists
    if (!cart) {

      cart = await prisma.cart.create({
        data: {
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

    }

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



// ❌ REMOVE CART ITEM
export const removeCartItem = async (
  req: Request,
  res: Response
) => {
  try {

    const user = (req as any).user;

    const { itemId } = req.params;

    // ✅ Find Item With Cart
    const item = await prisma.cartItem.findUnique({
      where: {
        id: itemId
      },
      include: {
        cart: true
      }
    });

    // ✅ Item Not Found
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // ✅ Ownership Check
    if (item.cart.userId !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // ✅ Delete Item
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



// 🔄 UPDATE CART ITEM QUANTITY
export const updateCartItemQuantity = async (
  req: Request,
  res: Response
) => {
  try {

    const user = (req as any).user;

    const { itemId } = req.params;

    const { quantity } = req.body;

    // ✅ Validate Quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // ✅ Find Item With Cart
    const item = await prisma.cartItem.findUnique({
      where: {
        id: itemId
      },
      include: {
        cart: true
      }
    });

    // ✅ Item Not Found
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // ✅ Ownership Check
    if (item.cart.userId !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // ✅ Update Quantity
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