import { Router } from 'express';

import {
  generateInvoice
} from '../controllers/invoice.controller';

import { protect } from '../middlewares/auth.middleware';

const router = Router();

// 📄 GENERATE INVOICE
router.get(
  '/:orderId',
  protect,
  generateInvoice
);

export default router;