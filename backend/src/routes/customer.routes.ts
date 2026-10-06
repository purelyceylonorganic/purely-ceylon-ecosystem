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
// ADDRESS MANAGEMENT
// ==========================================

// Add Address
router.post(
  "/:id/address",
  createCustomerAddress
);

// Edit Address
router.put(
  "/:id/address/:addressId",
  updateCustomerAddress
);

// Set Default Address
router.patch(
  "/:id/address/:addressId/default",
  setDefaultCustomerAddress
);

// Delete Address
router.delete(
  "/:id/address/:addressId",
  deleteCustomerAddress
);

// ==========================================
// CUSTOMER NOTES
// ==========================================

// Add Note
router.post(
  "/:id/notes",
  createCustomerNote
);

// Get Notes
router.get(
  "/:id/notes",
  getCustomerNotes
);

// Update Note
router.put(
  "/:id/notes/:noteId",
  updateCustomerNote
);

// Delete Note
router.delete(
  "/:id/notes/:noteId",
  deleteCustomerNote
);

export default router;