
import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

const router = Router();

// Category list
router.get("/", CategoryController.getAll);

// Create category — authorized admin/staff only
router.post(
  "/",
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_CREATE),
  CategoryController.create
);

export default router;
