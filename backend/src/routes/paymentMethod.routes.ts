import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";

import {
  addPaymentMethod,
  getPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod
} from "../controllers/paymentMethod.controller";

const router = Router();

router.post("/", protect, addPaymentMethod);

router.get("/", protect, getPaymentMethods);

router.delete("/:id", protect, deletePaymentMethod);

router.put("/default/:id", protect, setDefaultPaymentMethod);

export default router;