import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

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
router.get('/', ProductController.getAll);

router.post(
  '/',
  protect,
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  ProductController.create
);

router.put(
  '/:id',
  protect,
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  ProductController.update
);

router.delete(
  '/:id',
  protect,
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  ProductController.delete
);

export default router;