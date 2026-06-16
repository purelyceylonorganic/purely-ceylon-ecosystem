import express from "express";

import {
 createCoupon,
 getCoupons,
 validateCoupon
} from "../controllers/coupon.controller";

const router = express.Router();

router.post("/", createCoupon);

router.get("/", getCoupons);

router.post("/validate", validateCoupon);

export default router;