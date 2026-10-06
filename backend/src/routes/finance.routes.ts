import { Router } from "express";

import {
  getFinanceAnalytics,
  getMonthlyFinanceAnalytics,
} from "../controllers/finance.controller";

import {
  protect,
  restrictTo,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/analytics",
  protect,
  restrictTo("SUPER_ADMIN", "ADMIN"),
  getFinanceAnalytics
);

router.get(
  "/monthly",
  protect,
  restrictTo("SUPER_ADMIN", "ADMIN"),
  getMonthlyFinanceAnalytics
);

export default router;