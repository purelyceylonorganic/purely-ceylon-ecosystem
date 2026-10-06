import { Router } from "express";

import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller";

import {
  protect,
  restrictTo,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  protect,
  restrictTo("SUPER_ADMIN", "ADMIN"),
  getAllExpenses
);

router.get(
  "/:id",
  protect,
  restrictTo("SUPER_ADMIN", "ADMIN"),
  getExpenseById
);

router.post(
  "/",
  protect,
  restrictTo("SUPER_ADMIN", "ADMIN"),
  createExpense
);

router.put(
  "/:id",
  protect,
  restrictTo("SUPER_ADMIN", "ADMIN"),
  updateExpense
);

router.delete(
  "/:id",
  protect,
  restrictTo("SUPER_ADMIN", "ADMIN"),
  deleteExpense
);

export default router;