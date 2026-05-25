import { Router } from 'express';

import authRoutes from './auth.routes';
import cartRoutes from './cart.routes';

const router = Router();

// Auth Routes
router.use('/auth', authRoutes);

// Cart Routes
router.use('/cart', cartRoutes);

export default router;