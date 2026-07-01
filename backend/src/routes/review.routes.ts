import { Router } from "express";

import {
  addReview,
  getProductReviews,
  deleteReview,
} from "../controllers/review.controller";

import { protect } from "../middlewares/auth.middleware";

const router = Router();

// ⭐ Add Review
router.post(
  "/:productId",
  protect,
  addReview
);

// ⭐ Get Product Reviews
router.get(
  "/:productId",
  getProductReviews
);

// ⭐ Delete Review
router.delete(
  "/:id",
  protect,
  deleteReview
);

export default router;