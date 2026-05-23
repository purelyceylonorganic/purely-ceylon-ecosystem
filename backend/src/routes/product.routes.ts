import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// 🔍 தேடல் ரூட் (முக்கியமானது: இது('/:id')-க்கு மேலே இருக்க வேண்டும்)
router.get('/search', ProductController.search);

// மற்ற ரூட்கள்
router.get('/', ProductController.getAll);
router.post('/', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), ProductController.create);
router.put('/:id', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), ProductController.update);
router.delete('/:id', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), ProductController.delete);

export default router;
