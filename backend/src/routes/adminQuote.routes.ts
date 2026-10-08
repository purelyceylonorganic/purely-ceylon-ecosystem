import express from "express";

import {
  quoteRFQ,
  getPendingRFQs,
  acceptQuote,
  rejectQuote,
} from "../controllers/adminQuote.controller";

import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = express.Router();

console.log("ADMIN QUOTE ROUTES LOADED");

router.get(
  "/pending-rfqs",
  protect,
  authorizePermissions(PERMISSIONS.RFQ_VIEW),
  getPendingRFQs
);

router.post(
  "/quote/:id",
  protect,
  authorizePermissions(PERMISSIONS.RFQ_APPROVE),
  quoteRFQ
);

router.patch(
  "/accept/:id",
  protect,
  authorizePermissions(PERMISSIONS.RFQ_APPROVE),
  acceptQuote
);

router.patch(
  "/reject/:id",
  protect,
  authorizePermissions(PERMISSIONS.RFQ_APPROVE),
  rejectQuote
);

export default router;