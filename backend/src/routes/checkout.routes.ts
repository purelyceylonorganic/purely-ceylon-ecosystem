import { Router } from 'express';

import { checkout } from '../controllers/checkout.controller';

import { protect } from '../middlewares/auth.middleware';

const router = Router();

// 💳 CHECKOUT
router.post(
  '/',
  protect,
  checkout
);

export default router;