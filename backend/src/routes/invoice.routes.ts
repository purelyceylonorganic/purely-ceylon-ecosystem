import { Router } from 'express';
import { generateInvoice } from '../controllers/invoice.controller';
import { protect } from '../middlewares/auth.middleware';
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../constants/roles";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = Router();

// 💡 முக்கியம்: Roles செக் செய்வதற்கு முன் பயனர் லாகின் செய்துள்ளாரா (protect) எனப் பார்க்க வேண்டும்
router.use(protect); 

router.use(
  authorizeRoles(
    ROLES.FINANCE,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  )
);

// 📄 GENERATE & VIEW INVOICE
router.get(
  '/:orderId',
  authorizePermissions(PERMISSIONS.INVOICE_VIEW), // ✅ Task 9 Protection சேர்க்கப்பட்டது
  generateInvoice
);

export default router;