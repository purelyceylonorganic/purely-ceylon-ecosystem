import { Router } from "express";

import {
  searchCustomer,
  createQuickCustomer,
  customerProfile,
  createCustomerAddress,
  updateCustomerAddress,
  setDefaultCustomerAddress,
  deleteCustomerAddress,
  createCustomerNote,
  getCustomerNotes,
  customerHistory,
  getCustomerDashboardStats,
  getCustomers,
  updateCustomerNote,
  deleteCustomerNote,
} from "../controllers/customer.controller";

import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = Router();

router.get(
  "/search",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_VIEW),
  searchCustomer
);

router.post(
  "/quick-create",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_CREATE),
  createQuickCustomer
);

router.get(
  "/dashboard/stats",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_VIEW),
  getCustomerDashboardStats
);

router.get(
  "/",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_VIEW),
  getCustomers
);

router.get(
  "/:id/history",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_VIEW),
  customerHistory
);

router.get(
  "/:id",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_VIEW),
  customerProfile
);

router.post(
  "/:id/address",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_UPDATE),
  createCustomerAddress
);

router.put(
  "/:id/address/:addressId",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_UPDATE),
  updateCustomerAddress
);

router.patch(
  "/:id/address/:addressId/default",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_UPDATE),
  setDefaultCustomerAddress
);

router.delete(
  "/:id/address/:addressId",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_DELETE),
  deleteCustomerAddress
);

router.post(
  "/:id/notes",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_UPDATE),
  createCustomerNote
);

router.get(
  "/:id/notes",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_VIEW),
  getCustomerNotes
);

router.put(
  "/:id/notes/:noteId",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_UPDATE),
  updateCustomerNote
);

router.delete(
  "/:id/notes/:noteId",
  protect,
  authorizePermissions(PERMISSIONS.CUSTOMER_DELETE),
  deleteCustomerNote
);

export default router;