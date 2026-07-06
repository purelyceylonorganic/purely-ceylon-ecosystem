import express from "express";
import {
  createRFQ,
  getMyRFQs,
  getRFQById,
  cancelRFQ,
} from "../controllers/rfq.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../constants/roles";

const router = express.Router();

router.use(
  authorizeRoles(
    ROLES.BUYER
  )
);

router.post("/", protect, createRFQ);

// ✅ GET BUYER RFQs (TASK 10)
/**
 * @swagger
 * /b2b/rfq:
 * get:
 * summary: Get Buyer RFQs
 * tags:
 * - RFQ
 */
router.get("/", protect, getMyRFQs);

router.get("/:id", protect, getRFQById);
router.patch("/:id/cancel", protect, cancelRFQ);

export default router;