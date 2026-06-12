import express from "express";
import {
  addStock,
  removeStock,
  getInventory,
  getLowStock,
} from "../controllers/inventory.controller";

const router = express.Router();

//
// ============================
// INVENTORY ROUTES
// ============================
//

// ➕ Add stock
router.post("/add-stock", addStock);

// ➖ Remove stock
router.post("/remove-stock", removeStock);

// 📦 Get all inventory
router.get("/", getInventory);

// ⚠️ Low stock items
router.get("/low-stock", getLowStock);

export default router;