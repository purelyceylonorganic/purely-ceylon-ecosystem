import { Router } from "express";
import {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  getAllProducts,
} from "../controllers/admin.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

// 📊 Dashboard
router.get("/dashboard", getDashboardStats);

// 👤 Users
router.get("/users", getAllUsers);

router.use(
  authorizeRoles(
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  )
);

// 📦 Orders
router.get("/orders", getAllOrders);

// 🛒 Products
router.get("/products", getAllProducts);

export default router;