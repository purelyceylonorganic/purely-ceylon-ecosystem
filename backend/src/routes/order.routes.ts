import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { AddressController } from '../controllers/address.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// --- 🔒 அனைத்துமே பாதுகாக்கப்பட்ட எண்ட்-பாயிண்டுகள் (Authenticated Users Only) ---

// 🛒 செக்கவுட் & ஆர்டர் மேலாண்மை
router.post('/checkout', protect, OrderController.placeOrder);
router.get('/my-orders', protect, OrderController.getMyOrders);

// 📍 டெலிவரி முகவரி மேலாண்மை
router.post('/addresses', protect, AddressController.addAddress);
router.get('/addresses', protect, AddressController.getMyAddresses);
router.put('/addresses/:id', protect, AddressController.updateAddress);
router.delete('/addresses/:id', protect, AddressController.deleteAddress);

export default router;