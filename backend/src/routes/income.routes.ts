import { Router } from "express";

import {
  createIncome,
  getAllIncome,
  updateIncome,
  deleteIncome,
} from "../controllers/income.controller";

import { protect, restrictTo } from "../middlewares/auth.middleware";

const router = Router();

// Expense routes போலவே SUPER_ADMIN, ADMIN மட்டும்
router.use(protect, restrictTo("SUPER_ADMIN", "ADMIN"));

router.get("/", getAllIncome);
router.post("/", createIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

export default router;