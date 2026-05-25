import { Router } from 'express';

import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity
} from '../controllers/cart.controller';

import { protect } from '../middlewares/auth.middleware';

const router = Router();

// 🛒 Add To Cart
router.post('/add', protect, addToCart);

// 👀 View Cart
router.get('/', protect, getCart);

// ❌ Remove Item
router.delete('/remove/:itemId', protect, removeCartItem);

// 🔄 Update Quantity
router.put('/update/:itemId', protect, updateCartItemQuantity);

export default router;