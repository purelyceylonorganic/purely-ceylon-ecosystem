import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { CategoryController } from '../controllers/category.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// --- 🔓 பொதுவான வழிகள் (Public Routes - வாடிக்கையாளர்கள் பார்க்க) ---
router.get('/products', ProductController.getAll);
router.get('/categories', CategoryController.getAll);

// --- 🔒 பாதுகாக்கப்பட்ட வழிகள் (Admin-Only Secured Routes) ---
// ➕ புதிய கேட்டகிரி மற்றும் தயாரிப்பைச் சேர்த்தல்
router.post('/categories', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), CategoryController.create);
router.post('/products', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), ProductController.create);

// 📝 தயாரிப்பை திருத்துதல் மற்றும் நீக்குதல்
router.put('/products/:id', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), ProductController.update);
router.delete('/products/:id', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), ProductController.delete);

export default router;