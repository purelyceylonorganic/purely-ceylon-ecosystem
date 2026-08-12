import express from "express";
import {
  addStock,
  removeStock,
  getInventory,
  getLowStock,
  getTransactions,
} from "../controllers/inventory.controller";

const router = express.Router();

//
// ============================
// INVENTORY ROUTES
// ============================
//

router.post("/add-stock", addStock);

router.post("/remove-stock", removeStock);

router.get("/", getInventory);

router.get("/low-stock", getLowStock);

router.get("/transactions", getTransactions);

export default router;