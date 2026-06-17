import express from "express";
import {
  createRFQ,
  getMyRFQs,
  getRFQById,
  cancelRFQ,
} from "../controllers/rfq.controller";

import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", protect, createRFQ);
router.get("/", protect, getMyRFQs);
router.get("/:id", protect, getRFQById);
router.patch("/:id/cancel", protect, cancelRFQ);

export default router;