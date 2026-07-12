import { Router } from "express";
import { getCustomerDashboard } from "../controllers/customerDashboard.controller";
import { protect } from "../middlewares/auth.middleware"; // லாகின் தேவை எனில்

const router = Router();

// இங்கே '/' என்பது '/api/v1/customer/dashboard' ஐக் குறிக்கும்
router.get("/", protect, getCustomerDashboard);

export default router;