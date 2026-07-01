import { Router } from "express";

import {
  addToWishlist,
  getWishlist,
  removeWishlistItem,
} from "../controllers/wishlist.controller";

import { protect } from "../middlewares/auth.middleware";

const router = Router();

// ❤️ Add
router.post(
  "/add",
  protect,
  addToWishlist
);

// ❤️ Get
router.get(
  "/",
  protect,
  getWishlist
);

// ❤️ Remove
router.delete(
  "/:id",
  protect,
  removeWishlistItem
);

export default router;