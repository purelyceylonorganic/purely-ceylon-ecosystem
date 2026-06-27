import express from "express";
import {
  convertRFQToBulkOrder,
  getMyBulkOrders,
  getBulkOrderById,
  updateBulkOrderStatus,
  payBulkOrder
} from "../controllers/bulkOrder.controller";

const router = express.Router();


// ===============================
// 🔄 RFQ → BULK ORDER
// ===============================
router.post(
  "/convert/:rfqId",
  convertRFQToBulkOrder
);


// ===============================
// 📦 GET MY ORDERS
// ===============================
router.get(
  "/",
  getMyBulkOrders
);


// ===============================
// 🔍 GET SINGLE ORDER
// ===============================
router.get(
  "/:id",
  getBulkOrderById
);


// ===============================
// 🔄 UPDATE STATUS
// ===============================
router.patch(
  "/:id/status",
  updateBulkOrderStatus
);

// ===============================
// 💳 PAY BULK ORDER
// ===============================
router.post(
  "/:id/pay",
  payBulkOrder
);

export default router;