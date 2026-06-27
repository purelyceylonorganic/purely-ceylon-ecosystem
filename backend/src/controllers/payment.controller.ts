import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// 💳 CREATE PAYMENT
export const createPayment = async (
  req: Request,
  res: Response
) => {
  try {

    const user = (req as any).user;

    const {
      orderId,
      gateway
    } = req.body;

    // ✅ Find Order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.userId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '❌ Order not found'
      });
    }

    // ✅ Already Paid Check
    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: '✅ Order already paid'
      });
    }

    // ✅ Create Payment Record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        transactionId:
          'TXN-' + Date.now(),
        amount: order.totalFinal,
        gateway,
      }
    });

    // ✅ Update Order Payment Status
    await prisma.order.update({
      where: {
        id: order.id
      },
      data: {
        paymentStatus: 'PAID'
      }
    });

    return res.status(200).json({
      success: true,
      message: '💳 Payment successful',
      payment
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: '❌ Payment failed'
    });

  }
};