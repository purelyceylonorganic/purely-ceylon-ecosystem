import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🛒 ADD TO CART
export const addToCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity }
      });
    }

    return res.status(200).json({ success: true, message: '🛒 Item added to cart' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Cart add failed' });
  }
};

// 👀 GET CART
export const getCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: { items: { include: { product: true } } }
      });
    }

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
};

// ❌ REMOVE CART ITEM
export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { itemId } = req.params;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    if (item.cart.userId !== user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return res.status(200).json({ success: true, message: '🗑️ Item removed from cart' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
};

// 🔄 UPDATE CART ITEM QUANTITY
export const updateCartItemQuantity = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    if (item.cart.userId !== user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });

    return res.status(200).json({ success: true, message: '🔄 Cart quantity updated' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Failed to update quantity' });
  }
};