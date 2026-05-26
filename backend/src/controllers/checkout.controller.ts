import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkout = async (
  req: Request,
  res: Response
) => {
  try {

    const user = (req as any).user;

    // ✅ Find User Cart
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

    // ✅ Empty Cart Check
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '🛒 Cart is empty'
      });
    }

    // ✅ Calculate Total
    let totalAmount = 0;

    cart.items.forEach((item) => {
      totalAmount +=
        item.product.basePrice * item.quantity;
    });

    // ✅ Tax + Shipping
    const taxAmount = totalAmount * 0.05;

    const shippingCost = 500;

    const finalTotal =
      totalAmount + taxAmount + shippingCost;

    // ✅ Create Order
    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        totalAmount: finalTotal,
        taxAmount,
        shippingCost,
        paymentMethod: 'COD',

        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.basePrice
          }))
        }
      },
      include: {
        items: true
      }
    });

    // ✅ Clear Cart
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id
      }
    });

    return res.status(201).json({
      success: true,
      message: '✅ Checkout successful',
      order
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: '❌ Checkout failed'
    });

  }
};