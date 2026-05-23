import { Router, Request, Response } from 'express';
import express from 'express';
import { PaymentService } from '../services/payment.service';
import { protect, AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();

// 💳 1. செக்கவுட் பேமெண்ட் லிங்க் உருவாக்கும் ஏபிஐ (பாதுகாக்கப்பட்டது)
router.post('/create-checkout-session', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, totalAmount } = req.body;
  const email = req.user?.email || '';

  try {
    const paymentUrl = await PaymentService.createStripeSession(orderId, totalAmount, email);
    return res.json({ success: true, paymentUrl });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 🛡️ 2. ஸ்ட்ரைப் நிறுவனத்திடமிருந்து சிக்னல்களைப் பெறும் நேரடி வெப்ஹூக் எண்ட்பாயிண்ட் (Public & Hardened)
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }), // வெப்ஹூக்கிற்கு மட்டும் ராவ் டேட்டா பஃபர் தேவை
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    try {
      await PaymentService.handleStripeWebhook(req.body, signature);
      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error(error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

export default router;