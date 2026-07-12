import { Router, Response } from "express";

// Controllers from File 1 (shippingTracking.controller)
import { 
  getShipmentTracking, 
  updateShipmentStatus 
} from "../controllers/shippingTracking.controller";

// Controllers from File 2 (shipping.controller)
import {
  calculateShipping,
  updateShippingStatus,
  trackOrder
} from "../controllers/shipping.controller";

// Services
import { ShippingService } from "../services/shipping.service";

// Middlewares
import {
  protect,
  restrictTo,
  AuthenticatedRequest
} from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

// Constants
import { ROLES } from "../constants/roles";

const router = Router();

// ======================================================
// 🌍 PUBLIC & AUTHENTICATED USER ROUTES
// ======================================================

// 🔎 TRACK ORDER (From File 2)
router.get("/track/:trackingId", trackOrder);

// 🔎 TRACK SHIPMENT (From File 1)
// Note: Changed the path slightly to "/shipment-track" to prevent conflict with "/track" above. 
// If these do the same thing, you can delete this one and just use trackOrder.
router.get("/shipment-track/:trackingId", getShipmentTracking);

// 💰 CALCULATE SHIPPING
router.post("/calculate", calculateShipping);

// 🔓 CALCULATE LOCAL SHIPPING RATES
router.post("/calculate-rates", async (req, res) => {
  try {
    const { province, totalWeightKg } = req.body;

    // ✅ CALCULATE SHIPPING
    const cost = ShippingService.calculateLocalShipping(
      province,
      totalWeightKg || 1
    );

    return res.status(200).json({
      success: true,
      currency: "LKR",
      shippingCost: cost
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ======================================================
// 🔒 ADMIN & MANAGEMENT PROTECTED ROUTES
// ======================================================

// 🔒 EXPORT MANIFEST
router.get(
  "/export-manifest/:orderId",
  protect,
  authorizeRoles(ROLES.EXPORT_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  restrictTo("ADMIN", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId } = req.params;

      // ✅ GENERATE EXPORT MANIFEST
      const manifest = await ShippingService.generateExportManifest(orderId);

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

// 🚚 UPDATE SHIPMENT STATUS (From File 1)
// Note: Left unprotected as it was in File 1, but you can add the 'protect' middleware here if needed.
router.put("/status/:orderId", updateShipmentStatus);

// 🚚 ADMIN UPDATE SHIPPING STATUS (From File 2)
router.put(
  "/:id",
  protect,
  authorizeRoles(ROLES.EXPORT_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  restrictTo("ADMIN", "SUPER_ADMIN"),
  updateShippingStatus
);

export default router;