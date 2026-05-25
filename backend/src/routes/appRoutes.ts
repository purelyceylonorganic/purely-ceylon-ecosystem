import { Router } from 'express';
import { getStatus } from '../controllers/appController';
import testRoutes from './test.route';

const router = Router();

router.get('/status', getStatus);
router.use('/test', testRoutes);

export default router;