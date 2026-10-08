import express, { Router, Request, Response } from 'express';
import {
  createPayment,
  getOrderPayments,
  voidPayment,
  reversePayment,
  refundPayment,
} from '../controllers/payment.controller';
import { PaymentService } from '../services/payment.service';
import { protect, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";


const router = Router();


router.post(
  "/:paymentId/refund",
  protect,
  authorizePermissions(PERMISSIONS.REFUND_CREATE),
  refundPayment
);

router.post(
  "/:paymentId/reverse",
  protect,
  authorizePermissions(PERMISSIONS.PAYMENT_UPDATE),
  reversePayment
); 

router.patch(
  "/:paymentId/void",
  protect,
  authorizePermissions(PERMISSIONS.PAYMENT_UPDATE),
  voidPayment
);


// ======================================================
// 🛡️ WEBHOOK ROUTES
// ======================================================
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      await PaymentService.handleStripeWebhook(req.body, signature);
      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error(error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

router.post('/webhook/payhere', express.urlencoded({ extended: true }), async (req: Request, res: Response) => {
  try {
    await PaymentService.handlePayHereNotify(req.body);
    return res.status(200).send('OK');
  } catch (error: any) {
    console.error(error.message);
    return res.status(400).send(`PayHere Error: ${error.message}`);
  }
});

// ======================================================
// 🔒 PROTECTED POS ROUTES
// ======================================================
router.post('/', protect, createPayment);
router.post('/create', protect, createPayment);

// Payment History for an Order
router.get('/history/:orderId', protect, getOrderPayments);

router.post(
  "/:paymentId/refund",
  protect,
  authorizePermissions(PERMISSIONS.REFUND_CREATE),
  refundPayment
);

router.post(
  "/:paymentId/reverse",
  protect,
  authorizePermissions(PERMISSIONS.PAYMENT_UPDATE),
  reversePayment
);

router.patch(
  "/:paymentId/void",
  protect,
  authorizePermissions(PERMISSIONS.PAYMENT_UPDATE),
  voidPayment
);

// Stripe Checkout Session
router.post(
  '/create-checkout-session',
  protect,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId, totalAmount } = req.body;
      const email = req.user?.email || '';

      const paymentUrl = await PaymentService.createStripeSession(
        orderId,
        totalAmount,
        email
      );

      return res.status(200).json({
        success: true,
        paymentUrl
      });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message || '❌ Failed to create checkout session'
      });
    }
  }
);


export default router;