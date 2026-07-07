import express from "express";
import {
  getAdminDashboard,
  getBuyerDashboard
} from "../controllers/dashboard.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = express.Router();

router.get(
  "/admin",
  protect,
  authorizePermissions(PERMISSIONS.DASHBOARD_VIEW), // 👈 Permission Guard
  getAdminDashboard
);

router.get(
  "/buyer/:buyerId",
  protect,
  authorizePermissions(PERMISSIONS.DASHBOARD_VIEW), // 👈 Permission Guard
  getBuyerDashboard
);

export default router;