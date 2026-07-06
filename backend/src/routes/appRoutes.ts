import { Router } from 'express';
import { getStatus } from '../controllers/appController';
import testRoutes from './test.route';
import authRoutes from './auth.routes';
import cartRoutes from './cart.routes';

const router = Router();

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Backend Health Check
 *     tags:
 *       - Health
 *     responses:
 *       '200':
 *         description: Backend Running Successfully
 */
router.get("/status", getStatus);
router.use('/test', testRoutes);
router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);

export default router;