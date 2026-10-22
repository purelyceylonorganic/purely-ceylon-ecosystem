import { Router } from "express";

import {
  getDeliveryRoutes,
  createDeliveryRoute,
  updateDeliveryRoute,
  deleteDeliveryRoute,
} from "../controllers/deliveryroute.controller";

import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = Router();

router.use(protect);

router.get("/", authorizePermissions(PERMISSIONS.CUSTOMER_VIEW), getDeliveryRoutes);
router.post("/", authorizePermissions(PERMISSIONS.CUSTOMER_UPDATE), createDeliveryRoute);
router.put("/:id", authorizePermissions(PERMISSIONS.CUSTOMER_UPDATE), updateDeliveryRoute);
router.delete("/:id", authorizePermissions(PERMISSIONS.CUSTOMER_UPDATE), deleteDeliveryRoute);

export default router;