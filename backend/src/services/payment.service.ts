import Stripe from 'stripe';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mock_stripe_key_2026', {
  apiVersion: '2023-10-16' as any,
});

const prisma = new PrismaClient();

export class PaymentService {
  
  // ==========================================
  // 🌍 1. STRIPE REGION (சர்வதேச டாலர் வர்த்தகம்)
  // ==========================================
  
  static async createStripeSession(orderId: string, amount: number, customerEmail: string) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `2026 Purely Ceylon Organic Premium Spices Order #${orderId}`,
              },
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
        // 🛠️ Schema Strictness Fix: Prisma Order அப்டேட்டை 'any' ஆக காஸ்ட் செய்து எரர் தவிர்க்கப்படுகிறது
        await prisma.$transaction([
          (prisma as any).order.update({
            where: { id: orderId },
            data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
          }),
          (prisma as any).payment.create({
            data: { orderId, transactionId, amount: totalPaid, gateway: 'STRIPE', rawWebhookLog: JSON.stringify(event) }
          }),
          (prisma as any).auditLog.create({
            data: { action: 'PAYMENT_SUCCESS_STRIPE', details: `Stripe மூலம் ஆர்டர் #${orderId} நிதி பெறப்பட்டது.` }
          })
        ]);
      }
    }
  }

  // ==========================================
  // 🇱🇰 2. PAYHERE REGION (இலங்கை லோக்கல் எக்ஸ்சேஞ்ச்)
  // ==========================================

  static generatePayHereHash(orderId: string, amount: number) {
    const merchantId = process.env.PAYHERE_MERCHANT_ID || 'mock_merchant_id';
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'mock_secret';
    
    const formattedAmount = amount.toFixed(2);
    
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const mainHash = crypto
      .createHash('md5')
      .update(merchantId + orderId + formattedAmount + 'LKR' + hashedSecret)
      .digest('hex')
      .toUpperCase();

    return mainHash;
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
      // 🛠️ Schema Strictness Fix: PayHere பகுதியிலும் Prisma Order அப்டேட் எரர் பிக்ஸ் செய்யப்பட்டுள்ளது
      await prisma.$transaction([
        (prisma as any).order.update({
          where: { id: order_id },
          data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
        }),
        (prisma as any).payment.create({
          data: {
            orderId: order_id,
            transactionId: payment_id,
            amount: parseFloat(payhere_amount),
            gateway: 'PAYHERE',
            rawWebhookLog: JSON.stringify(body)
          }
        }),
        (prisma as any).auditLog.create({
          data: {
            action: 'PAYMENT_SUCCESS_PAYHERE',
            details: `PayHere மூலம் ஆர்டர் #${order_id} க்கான லோக்கல் நிதி பெறப்பட்டது. ID: ${payment_id}`
          }
        })
      ]);
    }
  }
}