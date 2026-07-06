import { Router } from 'express';

import {
  generateInvoice
} from '../controllers/invoice.controller';

import { protect } from '../middlewares/auth.middleware';
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

// 📄 GENERATE INVOICE
router.get(
  '/:orderId',
  protect,
  generateInvoice
);

export default router;