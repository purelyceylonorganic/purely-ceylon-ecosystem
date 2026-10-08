import express from "express";

import {
  addStock,
  removeStock,
  getInventory,
  getLowStock,
  getTransactions,
} from "../controllers/inventory.controller";

import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = express.Router();

router.get(
  "/",
  protect,
  authorizePermissions(PERMISSIONS.INVENTORY_VIEW),
  getInventory
);

router.get(
  "/low-stock",
  protect,
  authorizePermissions(PERMISSIONS.INVENTORY_VIEW),
  getLowStock
);

router.get(
  "/transactions",
  protect,
  authorizePermissions(PERMISSIONS.INVENTORY_VIEW),
  getTransactions
);

router.post(
  "/add-stock",
  protect,
  authorizePermissions(PERMISSIONS.INVENTORY_ADD_STOCK),
  addStock
);

router.post(
  "/remove-stock",
  protect,
  authorizePermissions(PERMISSIONS.INVENTORY_REMOVE_STOCK),
  removeStock
);

export default router;