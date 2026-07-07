import express from "express";

import {
  createRFQ,
  getMyRFQs,
  getRFQById,
  cancelRFQ,
} from "../controllers/rfq.controller";

import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { verifyRFQOwnership } from "../middlewares/rfqOwnership.middleware";

import { PERMISSIONS } from "../constants/permissions";

const router = express.Router();

// =======================================
// CREATE RFQ
// =======================================

router.post(
  "/",
  protect,
  authorizePermissions(PERMISSIONS.RFQ_CREATE),
  createRFQ
);

// =======================================
// GET BUYER RFQs
// =======================================

/**
 * @swagger
 * /b2b/rfq:
 *   get:
 *     summary: Get Buyer RFQs
 *     tags:
 *       - RFQ
 */

router.get(
  "/",
  protect,
  authorizePermissions(PERMISSIONS.RFQ_VIEW),
  getMyRFQs
);

// =======================================
// GET SINGLE RFQ
// =======================================

router.get(
  "/:id",
  protect,
  verifyRFQOwnership,
  getRFQById
);

// =======================================
// CANCEL RFQ
// =======================================

router.patch(
  "/:id/cancel",
  protect,
  verifyRFQOwnership,
  cancelRFQ
);

export default router;