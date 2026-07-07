import express from "express";
import {
  createShipment,
  getShipmentByBulkOrder
} from "../controllers/shipment.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = express.Router();
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

router.post("/", createShipment);

router.get("/bulk-order/:bulkOrderId", getShipmentByBulkOrder);

export default router;