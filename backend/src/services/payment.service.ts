import Stripe from 'stripe';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { PaymentStatus, PaymentMethod, RefundStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mock_stripe_key_2026', {
  apiVersion: '2023-10-16' as any,
});

export class PaymentService {

  // ==========================================
  // 🆔 TRANSACTION ID GENERATOR
  // ==========================================
  private static generateTransactionId(gateway: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomNum = Math.floor(100 + Math.random() * 900);

    switch (gateway.toUpperCase()) {
      case 'CASH':
        return `CASH-${year}${month}${day}-${randomNum}`;
      case 'CARD':
        return `CARD-${year}${month}${day}-${randomNum}`;
      case 'BANK':
      case 'BANK_TRANSFER':
        return `BANK-${year}${month}${day}-${randomNum}`;
      case 'PAYHERE':
        return `PH${Date.now()}`;
      case 'STRIPE':
        return `pi_${crypto.randomBytes(12).toString('hex')}`;
      default:
        return `TXN-${year}${month}${day}-${randomNum}`;
    }
  }

  // ==========================================
  // 💳 1. MANUAL & OFFLINE POS PAYMENTS
  // ==========================================
  static async processManualPayment(
    orderId: string, 
    amountPaid: number, 
    gateway: string, 
    paymentMethod: string,
    userId?: string,
    userEmail?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('❌ Order not found');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new Error('✅ Order is already fully paid');
    }

    const currentPaidAmount = Number(order.paidAmount || 0);
const totalFinal = Number(order.totalFinal);
const remainingBalance = Math.max(
  0,
  totalFinal - currentPaidAmount
);

if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
  throw new Error("Invalid payment amount");
}

if (remainingBalance <= 0) {
  throw new Error("Order is already fully paid");
}

if (amountPaid > remainingBalance) {
  throw new Error(
    `Payment amount exceeds remaining balance. Maximum payable amount: ${remainingBalance}`
  );
}

const newPaidAmount =
  currentPaidAmount + amountPaid;

const balance =
  Math.max(0, totalFinal - newPaidAmount);

let newPaymentStatus: PaymentStatus =
  PaymentStatus.PARTIAL;

if (newPaidAmount >= totalFinal) {
  newPaymentStatus = PaymentStatus.PAID;
}

    const transactionId = this.generateTransactionId(gateway);
    const now = new Date();

    // Map string paymentMethod to Prisma PaymentMethod Enum safely
    let mappedPaymentMethod: PaymentMethod;
    const upperMethod = paymentMethod.toUpperCase();
    if (['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'PAYHERE', 'STRIPE'].includes(upperMethod)) {
      mappedPaymentMethod = upperMethod as PaymentMethod;
    } else {
      mappedPaymentMethod = PaymentMethod.CASH;
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          transactionId,
          amount: amountPaid,
          currency: order.currency || 'LKR',
          gateway: gateway.toUpperCase(),
          paymentMethod: mappedPaymentMethod,
          paymentStatus: PaymentStatus.PAID
        }
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: newPaymentStatus,
          status: newPaymentStatus === PaymentStatus.PAID ? 'CONFIRMED' : order.status,
          paidAmount: currentPaidAmount,
          balance: balance,
          paidAt: newPaymentStatus === PaymentStatus.PAID ? now : order.paidAt
        }
      });

      await tx.auditLog.create({
        data: {
          userId: userId || null,
          userEmail: userEmail || null,
          module: 'PAYMENT',
          entityId: order.id,
          action: `PAYMENT_${newPaymentStatus}`,
          description: `ஆர்டர் #${orderId} க்கு ${gateway} மூலம் ${amountPaid} பெறப்பட்டது. பாக்கி: ${balance}`,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null
        }
      });

      return { payment, updatedOrder };
    });

    return result;
  }

  // ==========================================
  // 🌍 2. STRIPE REGION
  // ==========================================
  static async createStripeSession(orderId: string, amount: number, customerEmail: string) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: `Enterprise POS Order #${orderId}` },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?orderId=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/cancel`,
        customer_email: customerEmail,
        metadata: { orderId },
      });
      return session.url;
    } catch (error: any) {
      throw new Error(`❌ Stripe Session எரர்: ${error.message}`);
    }
  }

  static async handleStripeWebhook(payload: Buffer, signature: string) {
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'mock_webhook_secret'
      );
    } catch (err: any) {
      throw new Error(`⚠️ Webhook Signature Verification Failed: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;
      const transactionId = session.payment_intent as string;
      const totalPaid = session.amount_total ? session.amount_total / 100 : 0;

      if (orderId) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) return;

        const currentPaidAmount = (order.paidAmount || 0) + totalPaid;
        const balance = Math.max(0, order.totalFinal - currentPaidAmount);
        let newPaymentStatus: PaymentStatus = PaymentStatus.PARTIAL;
        if (currentPaidAmount >= order.totalFinal) {
          newPaymentStatus = PaymentStatus.PAID;
        }

        await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: { 
              paymentStatus: newPaymentStatus, 
              status: newPaymentStatus === PaymentStatus.PAID ? 'CONFIRMED' : order.status,
              paidAmount: currentPaidAmount,
              balance: balance,
              paidAt: new Date()
            }
          }),
          prisma.payment.create({
            data: { 
              orderId, 
              transactionId: transactionId || this.generateTransactionId('STRIPE'), 
              amount: totalPaid, 
              currency: order.currency || 'USD',
              gateway: 'STRIPE',
              paymentMethod: PaymentMethod.STRIPE, 
              paymentStatus: PaymentStatus.PAID,
              rawWebhookLog: JSON.stringify(event) 
            }
          }),
          prisma.auditLog.create({
            data: { 
              module: 'PAYMENT',
              entityId: orderId,
              action: 'PAYMENT_SUCCESS_STRIPE', 
              description: `Stripe மூலம் ஆர்டர் #${orderId} நிதி பெறப்பட்டது.` 
            }
          })
        ]);
      }
    }
  }

  // ==========================================
  // 🇱🇰 3. PAYHERE REGION
  // ==========================================
  static generatePayHereHash(orderId: string, amount: number) {
    const merchantId = process.env.PAYHERE_MERCHANT_ID || 'mock_merchant_id';
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'mock_secret';
    const formattedAmount = amount.toFixed(2);
    
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    return crypto
      .createHash('md5')
      .update(merchantId + orderId + formattedAmount + 'LKR' + hashedSecret)
      .digest('hex')
      .toUpperCase();
  }

  static async handlePayHereNotify(body: any) {
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig, payment_id } = body;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'mock_secret';

    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const localHash = crypto
      .createHash('md5')
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
      .digest('hex')
      .toUpperCase();

    if (localHash !== md5sig) {
      throw new Error('⚠️ Security Alert: PayHere MD5 Signature Mismatch! Fraud Attempt Blocked.');
    }

    if (status_code === '2') {
      const paidAmountNum = parseFloat(payhere_amount);
      const order = await prisma.order.findUnique({ where: { id: order_id } });
      if (!order) return;

      const currentPaidAmount = (order.paidAmount || 0) + paidAmountNum;
      const balance = Math.max(0, order.totalFinal - currentPaidAmount);
      let newPaymentStatus: PaymentStatus = PaymentStatus.PARTIAL;
      if (currentPaidAmount >= order.totalFinal) {
        newPaymentStatus = PaymentStatus.PAID;
      }

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order_id },
          data: { 
            paymentStatus: newPaymentStatus, 
            status: newPaymentStatus === PaymentStatus.PAID ? 'CONFIRMED' : order.status,
            paidAmount: currentPaidAmount,
            balance: balance,
            paidAt: new Date()
          }
        }),
        prisma.payment.create({
          data: {
            orderId: order_id,
            transactionId: payment_id || this.generateTransactionId('PAYHERE'),
            amount: paidAmountNum,
            currency: payhere_currency || 'LKR',
            gateway: 'PAYHERE',
            paymentMethod: PaymentMethod.PAYHERE, 
            paymentStatus: PaymentStatus.PAID,
            rawWebhookLog: JSON.stringify(body)
          }
        }),
        prisma.auditLog.create({
          data: {
            module: 'PAYMENT',
            entityId: order_id,
            action: 'PAYMENT_SUCCESS_PAYHERE',
            description: `PayHere மூலம் ஆர்டர் #${order_id} க்கான நிதி பெறப்பட்டது. ID: ${payment_id}`
          }
        })
      ]);
    }
  }


  static async voidPayment(
    paymentId: string,
    reason: string,
    userId?: string
  ) {
    return await prisma.$transaction(async (tx) => {

      // 1. Find Payment
      const payment = await tx.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      // Already Voided
      if (payment.paymentStatus === PaymentStatus.VOIDED) {
        throw new Error("Payment already voided");
      }

      // Only PAID payments can be voided
      if (payment.paymentStatus !== PaymentStatus.PAID) {
        throw new Error("Only paid payments can be voided");
      }

      // 2. Find Order
      const order = await tx.order.findUnique({
        where: {
          id: payment.orderId,
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // 3. Void Payment
      const updatedPayment = await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          paymentStatus: PaymentStatus.VOIDED,
          notes: reason,
        },
      });

      // 4. Recalculate Order Payment Status
      const paidPayments = await tx.payment.findMany({
        where: {
          orderId: payment.orderId,
          paymentStatus: PaymentStatus.PAID,
        },
      });

      const paidAmount = paidPayments.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      let orderStatus: PaymentStatus;

      if (paidAmount <= 0) {
        orderStatus = PaymentStatus.UNPAID;
      } else if (paidAmount < order.totalFinal) {
        orderStatus = PaymentStatus.PARTIAL;
      } else {
        orderStatus = PaymentStatus.PAID;
      }

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: orderStatus,
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: "VOID_PAYMENT",
          module: "PAYMENT",
          description: `Payment ${payment.transactionId} voided. Reason: ${reason}`,
        },
      });

      return updatedPayment;
    });
  }

  static async refundPayment(
    paymentId: string,
    amount: number,
    reason: string,
    userId?: string
  ) {
    // 1. Find Payment
    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        order: true,
        refunds: true,
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // 2. Payment must be PAID
    if (payment.paymentStatus !== PaymentStatus.PAID) {
      throw new Error("Only paid payments can be refunded");
    }

    // 3. Calculate Already Refunded Amount
    const refundedAmount = payment.refunds.reduce(
      (sum, refund) => sum + refund.amount,
      0
    );

    // 4. Remaining Refundable Amount
    const refundable = payment.amount - refundedAmount;

    if (amount > refundable) {
      throw new Error("Refund amount exceeds available payment");
    }

    if (amount <= 0) {
      throw new Error("Invalid refund amount");
    }

    const transactionId = `RF-${Date.now()}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Refund Record
      const refund = await tx.refund.create({
        data: {
          paymentId: payment.id,
          transactionId,
          amount,
          reason,
          status: RefundStatus.COMPLETED,
          createdBy: userId,
        },
      });

      // Update Payment Status
      await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          paymentStatus:
            amount === refundable
              ? PaymentStatus.REFUNDED
              : PaymentStatus.PARTIAL,
        },
      });

      // 2. Calculate New Order Values
      const newPaidAmount = Math.max(
        0,
        (payment.order.paidAmount || 0) - amount
      );

      const newBalance =
        payment.order.totalFinal - newPaidAmount;

      // 3. Determine Payment Status
      let newStatus: PaymentStatus;

      if (newPaidAmount <= 0) {
        newStatus = PaymentStatus.UNPAID;
      } else if (newPaidAmount < payment.order.totalFinal) {
        newStatus = PaymentStatus.PARTIAL;
      } else {
        newStatus = PaymentStatus.PAID;
      }

      // 4. Update Order
      const order = await tx.order.update({
        where: {
          id: payment.order.id,
        },
        data: {
          paidAmount: newPaidAmount,
          balance: newBalance,
          paymentStatus: newStatus,
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: "PAYMENT_REFUND",
          module: "PAYMENT",
          entityId: refund.id,
          description: `Refund completed. Payment: ${payment.id}, Amount: ${amount}, Reason: ${reason}`,
        },
      });

      return {
        refund,
        order,
      };
    });

    return result;
  }


  // ==========================================
// 🔄 5. REVERSE PAYMENT
// ==========================================

static async reversePayment(
  paymentId: string,
  reason: string,
  userId?: string
) {
  // 1. Find Payment
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found.");
  }

  // Already reversed?
  if (payment.paymentStatus === "REVERSED") {
    throw new Error("Payment already reversed.");
  }

  // Refunded payment cannot be reversed
  if (payment.paymentStatus === "REFUNDED") {
    throw new Error("Refunded payment cannot be reversed.");
  }

  const order = payment.order;

  const newPaidAmount = Math.max(
    0,
    (order.paidAmount ?? 0) - payment.amount
  );

  const newBalance = Math.max(
    0,
    order.totalFinal - newPaidAmount
  );

  let newOrderPaymentStatus: any = "UNPAID";

  if (newPaidAmount === 0) {
    newOrderPaymentStatus = "UNPAID";
  } else if (newPaidAmount < order.totalFinal) {
    newOrderPaymentStatus = "PARTIAL";
  } else {
    newOrderPaymentStatus = "PAID";
  }

  return await prisma.$transaction(async (tx) => {

    // Reverse payment
    const updatedPayment = await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        paymentStatus: "REVERSED",
        notes: reason,
      },
    });

    // Update order
    const updatedOrder = await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
  paymentStatus: newOrderPaymentStatus,
  paidAmount: newPaidAmount,
  balance: newBalance,
  paidAt:
    newPaidAmount === 0
      ? null
      : order.paidAt,
},
    });

    // Audit Log
    await tx.auditLog.create({
      data: {
        userId,
        module: "PAYMENT",
        action: "REVERSE_PAYMENT",
        description:
          `Payment ${payment.transactionId} reversed. Reason: ${reason}`,
      },
    });

    return {
      payment: updatedPayment,
      order: updatedOrder,
    };
  });
}
  // ==========================================
  // 🔄 4. HISTORY MODULE
  // ==========================================
  static async getPaymentHistory(orderId: string) {
    return await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

}