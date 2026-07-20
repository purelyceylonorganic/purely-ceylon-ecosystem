import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { protect } from '../middlewares/auth.middleware';
import { authorizePermissions } from '../middlewares/permission.middleware'; // 👈 புதிய இறக்குமதி
import { PERMISSIONS } from '../constants/permissions'; // 👈 புதிய இறக்குமதி
import { validate } from "../middlewares/validate.middleware";

import {
  createProductSchema,
} from "../validators/product.validator";


const router = Router();

router.get('/search', ProductController.search);

router.get("/:id", ProductController.getById);

// ✅ GET ALL PRODUCTS (TASK 9)
/**
 * @swagger
 * /products:
 * get:
 * summary: Get All Products
 * tags:
 * - Products
 */

router.get(
  "/public",
  ProductController.getPublic
);

router.get('/', ProductController.getAll);

// 🔒 பழைய restrictTo-க்கு பதிலாக புதிய Permission Check:
router.put(
  "/restore/:id",
  protect,
  ProductController.restore
);

router.put(
  "/bulk-status",
  protect,
  ProductController.bulkUpdateStatus
);

router.post(
  "/",
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_CREATE),
  validate(createProductSchema),
  ProductController.create
);

router.put(
  '/:id',
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_UPDATE),
  ProductController.update
);

router.delete(
  '/:id',
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_DELETE),
  ProductController.delete
);

export default router;