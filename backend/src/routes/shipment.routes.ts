import express from "express";
import {
  createShipment,
  getShipmentByBulkOrder
} from "../controllers/shipment.controller";
import { protect } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permissions";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { updateShipmentStatus } from "../controllers/shippingTracking.controller";
import { ROLES } from "../constants/roles";
import { updateShippingStatus } from "../controllers/shipping.controller";
const router = express.Router();

router.put(
  "/status/:orderId",
  protect,
  authorizeRoles(
    ROLES.EXPORT_MANAGER,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  ),
  authorizePermissions(PERMISSIONS.SHIPMENT_UPDATE),
  updateShipmentStatus
);

router.put(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.EXPORT_MANAGER,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  ),
  authorizePermissions(PERMISSIONS.SHIPMENT_UPDATE),
  updateShippingStatus
);

router.post(
    "/",
    protect,
    authorizePermissions(PERMISSIONS.SHIPMENT_CREATE),
    createShipment
);
router.get(
    "/:bulkOrderId",
    protect,
    authorizePermissions(PERMISSIONS.SHIPMENT_VIEW),
    getShipmentByBulkOrder
);

export default router;