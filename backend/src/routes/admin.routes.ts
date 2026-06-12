import { Router } from "express";
import {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  getAllProducts,
} from "../controllers/admin.controller";

const router = Router();

// 📊 Dashboard
router.get("/dashboard", getDashboardStats);

// 👤 Users
router.get("/users", getAllUsers);

// 📦 Orders
router.get("/orders", getAllOrders);

// 🛒 Products
router.get("/products", getAllProducts);

export default router;