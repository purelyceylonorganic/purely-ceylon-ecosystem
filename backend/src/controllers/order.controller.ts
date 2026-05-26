import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// 🚀 PLACE ORDER
export const placeOrder = async (
  req: Request,
  res: Response
) => {
  try {

    const user = (req as any).user;

    const {
      items,
      addressId,
      paymentMethod,
      shippingCost
    } = req.body;

    // ✅ VALIDATIONS
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '❌ Your cart is empty'
      });
    }

    if (!user?.userId) {
      return res.status(401).json({
        success: false,
        message: '❌ Unauthorized user'
      });
    }

    let totalAmount = 0;

    const orderItemsData: {
  productId: string;
  quantity: number;
  price: number;
}[] = [];

    // ✅ VERIFY PRODUCTS + STOCK
    for (const item of items) {

      const product = await prisma.product.findUnique({
        where: {
          id: item.productId
        }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: '❌ Product not found'
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `❌ Insufficient stock for ${product.name}`
        });
      }

      const itemTotal =
        Number(product.basePrice) * item.quantity;

      totalAmount += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.basePrice)
      });

    }

    // ✅ TAX CALCULATION
    const taxAmount = totalAmount * 0.18;

    const finalTotal =
      totalAmount +
      taxAmount +
      Number(shippingCost || 0);

    // ✅ DATABASE TRANSACTION
    const newOrder = await prisma.$transaction(async (tx) => {

      // 📉 UPDATE STOCK
      for (const item of items) {

        const product = await tx.product.findUnique({
          where: {
            id: item.productId
          }
        });

        await tx.product.update({
          where: {
            id: item.productId
          },
          data: {
            stock: (product?.stock || 0) - item.quantity
          }
        });

      }

      // 🧾 CREATE ORDER
      const order = await tx.order.create({
        data: {
          userId: user.userId,
          addressId,
          totalAmount: finalTotal,
          taxAmount,
          shippingCost: Number(shippingCost || 0),
          paymentMethod,
          status: 'PENDING',
          paymentStatus:
            paymentMethod === 'COD'
              ? 'UNPAID'
              : 'PAID',

          items: {
            create: orderItemsData
          }
        },

        include: {
          items: true
        }
      });

      return order;

    });

    // ✅ SUCCESS RESPONSE
    return res.status(201).json({
      success: true,
      message:
        '✅ Order placed successfully',
      orderId: newOrder.id,
      order: newOrder
    });

  } catch (error: any) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: '❌ Failed to place order',
      error: error.message
    });

  }
};



// 📦 GET MY ORDERS
export const getMyOrders = async (
  req: Request,
  res: Response
) => {
  try {

    const user = (req as any).user;

    const orders = await prisma.order.findMany({
      where: {
        userId: user.userId
      },

      include: {
        items: {
          include: {
            product: true
          }
        },

        payments: true
      },

      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      orders
    });

  } catch (error: any) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: '❌ Failed to fetch orders',
      error: error.message
    });

  }
};



// 📦 GET SINGLE ORDER
export const getSingleOrder = async (
  req: Request,
  res: Response
) => {
  try {

    const user = (req as any).user;

    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.userId
      },

      include: {
        items: {
          include: {
            product: true
          }
        },

        payments: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '❌ Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error: any) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: '❌ Failed to fetch order',
      error: error.message
    });

  }
};