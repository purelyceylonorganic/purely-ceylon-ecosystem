import { Router } from 'express';

import authRoutes from './auth.routes';
import cartRoutes from './cart.routes';
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import orderRoutes from "./order.routes";
import wishlistRoutes from "./wishlist.routes";
import reviewRoutes from "./review.routes";
import couponRoutes from "./coupon.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/reviews", reviewRoutes);
router.use("/coupons", couponRoutes);

export default router;