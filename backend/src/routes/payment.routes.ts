import express, {
  Router,
  Request,
  Response
} from 'express';

import {
  createPayment
} from '../controllers/payment.controller';

import { PaymentService } from '../services/payment.service';

import {
  protect,
  AuthenticatedRequest
} from '../middlewares/auth.middleware';
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

router.use(
  authorizeRoles(
    ROLES.FINANCE,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  )
);
// ======================================================
// 💳 PAYMENT ROUTES
// ======================================================


// 💳 CREATE PAYMENT
router.post(
  '/',
  protect,
  createPayment
);


// 💳 CREATE STRIPE CHECKOUT SESSION
router.post(
  '/create-checkout-session',
  protect,
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const {
        orderId,
        totalAmount
      } = req.body;

      const email =
        req.user?.email || '';

      // ✅ CREATE STRIPE SESSION
      const paymentUrl =
        await PaymentService.createStripeSession(
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
        message:
          error.message ||
          '❌ Failed to create checkout session'
      });

    }

  }
);


// 🛡️ STRIPE WEBHOOK
router.post(
  '/webhook/stripe',

  express.raw({
    type: 'application/json'
  }),

  async (
    req: Request,
    res: Response
  ) => {

    try {

      const signature =
        req.headers[
          'stripe-signature'
        ] as string;

      // ✅ HANDLE STRIPE WEBHOOK
      await PaymentService.handleStripeWebhook(
        req.body,
        signature
      );

      return res.status(200).json({
        received: true
      });

    } catch (error: any) {

      console.error(error.message);

      return res.status(400).send(
        `Webhook Error: ${error.message}`
      );

    }

  }
);


export default router;