import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 💳 CREATE PAYMENT (உறுதிப்படுத்தப்பட்ட ஒருங்கிணைந்த கன்ட்ரோலர்)
export const createPayment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { orderId, gateway, paymentMethod } = req.body;

    // input-ல் எந்தப் பெயர் வந்தாலும் பயன்படுத்திக் கொள்ளும் வசதி
    const selectedGateway = gateway || paymentMethod || 'UNKNOWN_GATEWAY';

    // ✅ 1. Find Order (ஆர்டர் இருக்கிறதா என சரிபார்த்தல்)
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

    // ✅ 2. Already Paid Check (ஏற்கனவே பணம் செலுத்தப்பட்டதா என சரிபார்த்தல்)
    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: '✅ Order already paid'
      });
    }

    // ✅ 3. Create Payment Record (பணம் செலுத்தியதற்கான தரவை உருவாக்குதல்)
    const transactionId = 'TXN-' + Date.now();
    await prisma.payment.create({
      data: {
        orderId: order.id,
        transactionId: transactionId,
        amount: order.totalFinal,
        gateway: selectedGateway,
      }
    });

    // ✅ 4. Update Order Payment Status (ஆர்டர் நிலையை மாற்றுதல்)
    await prisma.order.update({
      where: {
        id: order.id
      },
      data: {
        paymentStatus: 'PAID'
      },
      include: {
        user: true // schema-வில் wholesaleBuyer என இருந்தால் அதை மாற்றிக்கொள்ளவும்
      }
    });

    // ✅ 5. Unified Success Response (ஒருங்கிணைக்கப்பட்ட பதில்)
    return res.status(200).json({
      success: true,
      message: '🎉 Payment successfully processed',
      data: {
        orderId: order.id,
        transactionId,
        amount: order.totalFinal,
        paymentMethod: selectedGateway,
        paymentUrl: '/payment-success'
      }
    });

  } catch (error: any) {
    console.error('❌ Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '❌ Payment failed internal server error'
    });
  }
};