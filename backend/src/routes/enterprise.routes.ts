import { Router } from 'express';
import { EnterpriseService } from '../services/enterprise.service';

const router = Router();

// 📱 மொபைல் ஆப் டேட்டா ஃபீட் (Mobile App Gateway)
router.get('/mobile/catalog', async (req, res, next) => {
  try {
    const catalog = await EnterpriseService.getMobileCatalog();
    return res.json({ success: true, count: catalog.length, products: catalog });
  } catch (error) {
    next(error);
  }
});

// 🤖 AI/Smart தயாரிப்பு பரிந்துரை ஏபிஐ (Product Recommendations)
router.get('/products/:id/recommendations', async (req, res, next) => {
  try {
    const { id } = req.params;
    const items = await EnterpriseService.getSmartRecommendations(id);
    return res.json({ success: true, recommendations: items });
  } catch (error) {
    next(error);
  }
});

export default router;