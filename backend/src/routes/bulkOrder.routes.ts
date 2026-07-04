import express from "express";
import {
  convertRFQToBulkOrder,
  getMyBulkOrders,
  getBulkOrderById,
  updateBulkOrderStatus,
  payBulkOrder,
  getBulkOrderHistory // ✅ இம்போர்ட் சேர்க்கப்பட்டது
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
// 📜 GET ORDER HISTORY
// ===============================
// ✅ நீங்கள் குறிப்பிட்டபடி இங்கிருந்தே ஹிஸ்டரி ரூட் சரியாக சேர்க்கப்பட்டுள்ளது
router.get(
  "/:id/history",
  getBulkOrderHistory
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