import {
  Router,
  Response
} from 'express';

import {
  updateShippingStatus,
  trackOrder
} from '../controllers/shipping.controller';

import { ShippingService } from '../services/shipping.service';

import {
  protect,
  restrictTo,
  AuthenticatedRequest
} from '../middlewares/auth.middleware';

const router = Router();


// ======================================================
// 🚚 SHIPPING ROUTES
// ======================================================


// 🔓 CALCULATE SHIPPING RATES
router.post(
  '/calculate-rates',

  async (req, res) => {

    try {

      const {
        province,
        totalWeightKg
      } = req.body;

      // ✅ CALCULATE SHIPPING
      const cost =
        ShippingService.calculateLocalShipping(
          province,
          totalWeightKg || 1
        );

      return res.status(200).json({
        success: true,
        currency: 'LKR',
        shippingCost: cost
      });

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }

  }
);


// 🔒 EXPORT MANIFEST
router.get(
  '/export-manifest/:orderId',

  protect,

  restrictTo(
    'ADMIN',
    'SUPER_ADMIN'
  ),

  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const { orderId } = req.params;

      // ✅ GENERATE EXPORT MANIFEST
      const manifest =
        await ShippingService.generateExportManifest(
          orderId
        );

      return res.status(200).json({
        success: true,
        manifest
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }

  }
);


// 🚚 ADMIN UPDATE SHIPPING STATUS
router.put(
  '/:id',
  protect,
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  updateShippingStatus
);


// 🔎 TRACK ORDER
router.get(
  '/track/:trackingId',

  trackOrder
);


export default router;