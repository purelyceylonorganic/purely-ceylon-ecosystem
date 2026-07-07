import express from "express";
import {
  convertRFQToBulkOrder,
  getMyBulkOrders,
  getBulkOrderById,
  updateBulkOrderStatus,
  payBulkOrder,
  getBulkOrderHistory,
} from "../controllers/bulkOrder.controller";

import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { verifyBulkOrderOwnership } from "../middlewares/resourceOwnership.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = express.Router();

// =======================================
// RFQ → BULK ORDER CONVERSION
// =======================================
router.post(
  "/convert/:rfqId",
  protect,
  convertRFQToBulkOrder
);

// =======================================
// GET MY BULK ORDERS
// =======================================
router.get(
  "/",
  protect,
  authorizePermissions(PERMISSIONS.BULK_ORDER_VIEW),
  getMyBulkOrders
);

// =======================================
// GET SINGLE BULK ORDER
// =======================================
router.get(
  "/:id",
  protect,
  verifyBulkOrderOwnership,
  getBulkOrderById
);

// =======================================
// BULK ORDER STATUS HISTORY
// =======================================
router.get(
  "/:id/history",
  protect,
  verifyBulkOrderOwnership,
  getBulkOrderHistory
);

// =======================================
// UPDATE BULK ORDER STATUS
// =======================================
router.patch(
  "/:id/status",
  protect,
  authorizePermissions(PERMISSIONS.BULK_ORDER_UPDATE),
  updateBulkOrderStatus
);

// =======================================
// PAY BULK ORDER
// =======================================
router.post(
  "/:id/pay",
  protect,
  verifyBulkOrderOwnership,
  authorizePermissions(PERMISSIONS.BULK_ORDER_PAYMENT), // ✅ Task 10 Protection சேர்க்கப்பட்டது
  payBulkOrder
);

export default router;