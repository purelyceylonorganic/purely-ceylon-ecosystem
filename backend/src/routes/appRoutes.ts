import { Router } from 'express';
import { getStatus } from '../controllers/appController';
import testRoutes from './test.route';
import authRoutes from './auth.routes';

const router = Router();

router.get('/status', getStatus);
router.use('/test', testRoutes);
router.use('/auth', authRoutes);

export default router;