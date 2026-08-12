import { Router } from "express";

import {
  searchCustomer,
  createQuickCustomer,
  customerProfile,
  createCustomerAddress,
  createCustomerNote,
  getCustomerNotes,
  customerHistory,
  getCustomerDashboardStats,
  getCustomers,
} from "../controllers/customer.controller";

const router = Router();

// ==========================================
// CUSTOMER SEARCH
// ==========================================

router.get(
  "/search",
  searchCustomer
);

// ==========================================
// QUICK CREATE
// ==========================================

router.post(
  "/quick-create",
  createQuickCustomer
);

// ==========================================
// CUSTOMER DASHBOARD STATS
// ==========================================

router.get(
  "/dashboard/stats",
  getCustomerDashboardStats
);

// ==========================================
// CUSTOMER LIST
// ==========================================

router.get(
  "/",
  getCustomers
);

// ==========================================
// CUSTOMER HISTORY
// ==========================================

router.get(
  "/:id/history",
  customerHistory
);

// ==========================================
// CUSTOMER PROFILE
// ==========================================

router.get(
  "/:id",
  customerProfile
);

// ==========================================
// CUSTOMER ADDRESS
// ==========================================

router.post(
  "/:id/address",
  createCustomerAddress
);

// ==========================================
// CUSTOMER NOTES
// ==========================================

router.post(
  "/:id/notes",
  createCustomerNote
);

router.get(
  "/:id/notes",
  getCustomerNotes
);

export default router;