import { Router } from 'express';

import { addToCart } from '../controllers/cart.controller';

import { protect } from '../middlewares/auth.middleware';

const router = Router();

// 🛒 Add To Cart
router.post('/add', protect, addToCart);

export default router;