import express from "express";
import {
  getSalesSummary,
  getShipmentReport,
  getBuyerReport
} from "../controllers/report.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = express.Router();

router.get(
  "/sales",
  protect,
  authorizePermissions(PERMISSIONS.REPORT_VIEW), // 👈 Permission Guard
  getSalesSummary
);

router.get(
  "/shipment",
  protect,
  authorizePermissions(PERMISSIONS.REPORT_VIEW), // 👈 Permission Guard
  getShipmentReport
);

router.get(
  "/buyers",
  protect,
  authorizePermissions(PERMISSIONS.REPORT_VIEW), // 👈 Permission Guard
  getBuyerReport
);

export default router;