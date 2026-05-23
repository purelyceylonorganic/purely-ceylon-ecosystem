import { Router } from 'express';
import { getStatus } from '../controllers/appController';

const router = Router();

router.get('/status', getStatus);

export default router;