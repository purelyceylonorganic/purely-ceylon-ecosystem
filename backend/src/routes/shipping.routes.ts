import { Router, Response } from 'express';
import { ShippingService } from '../services/shipping.service';
import { protect, restrictTo, AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();

// 🔓 1. ஷிப்பிங் கட்டணத்தைக் கணக்கிடும் பொதுவான ஏபிஐ (வாடிக்கையாளர்கள் செக்கவுட்டில் பார்க்க)
router.post('/calculate-rates', async (req, res) => {
  const { province, totalWeightKg } = req.body;
  
  try {
    const cost = ShippingService.calculateLocalShipping(province, totalWeightKg || 1);
    return res.json({ success: true, currency: "LKR", shippingCost: cost });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// 🔒 2. சர்வதேச ஏற்றுமதி ஆவணத்தைப் பெறும் பாதுகாக்கப்பட்ட ஏபிஐ (Admin & Super Admin Only)
router.get('/export-manifest/:orderId', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  
  try {
    const manifest = await ShippingService.generateExportManifest(orderId);
    return res.json({ success: true, manifest });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;