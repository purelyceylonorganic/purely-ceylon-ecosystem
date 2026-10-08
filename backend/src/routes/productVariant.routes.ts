import { Router } from "express";

import {
  createProductVariant,
  getAllVariants,
  getVariantById,
  updateVariant,
  deleteVariant,
} from "../controllers/productVariant.controller";

import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = Router();

/**
 * GET ALL PRODUCT VARIANTS
 * Public — customer product pages may need variants
 */
router.get(
  "/",
  getAllVariants
);

/**
 * GET SINGLE PRODUCT VARIANT
 * Public — customer product pages may need variant details
 */
router.get(
  "/:id",
  getVariantById
);

/**
 * CREATE PRODUCT VARIANT
 * Admin / authorized staff
 */
router.post(
  "/",
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_CREATE),
  createProductVariant
);

/**
 * UPDATE PRODUCT VARIANT
 * Admin / authorized staff
 */
router.put(
  "/:id",
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_UPDATE),
  updateVariant
);

/**
 * DELETE PRODUCT VARIANT
 * Admin / authorized staff
 */
router.delete(
  "/:id",
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_DELETE),
  deleteVariant
);

export default router;