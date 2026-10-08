import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  updateOrderStatusController,
  getAllOrders,
  updateShippingController,
  getDashboardStats,
  createAdminOrderController,
  addProductToOrderController,
  getOrderDetailsController,
  updateOrderItemQuantityController,
  removeProductFromOrderController,
  confirmOrderController,
} from "../controllers/order.controller";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";
import { AddressController } from "../controllers/address.controller";
import { protect } from "../middlewares/auth.middleware";
import { generateInvoice } from "../controllers/invoice.controller";

const router = Router();


// ======================================================
// TEST ROUTE
// ======================================================
router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Order Routes Working",
  });
});

// ======================================================
// ADMIN ROUTES (MUST COME BEFORE /:id or /:orderId)
// ======================================================
router.get(
  "/admin/all",
  protect,
  authorizePermissions(PERMISSIONS.ORDER_VIEW),
  getAllOrders
);

router.get(
  "/admin/dashboard",
  protect,
  authorizePermissions(PERMISSIONS.DASHBOARD_VIEW),
  getDashboardStats
);

router.post(
  "/admin/create",
  protect,
  authorizePermissions(PERMISSIONS.ORDER_UPDATE),
  createAdminOrderController
);
router.post(
  "/admin/add-product",
  protect,
  authorizePermissions(PERMISSIONS.ORDER_UPDATE),
  addProductToOrderController
);
router.put(
  "/admin/update-quantity",
  protect,
  authorizePermissions(PERMISSIONS.ORDER_UPDATE),
  updateOrderItemQuantityController
);
router.delete(
  "/admin/remove-product",
  protect,
  authorizePermissions(PERMISSIONS.ORDER_UPDATE),
  removeProductFromOrderController
);
router.put(
  "/admin/confirm",
  protect,
  authorizePermissions(PERMISSIONS.ORDER_UPDATE),
  confirmOrderController
);

router.get("/admin/all", protect, authorizePermissions(PERMISSIONS.ORDER_VIEW), getAllOrders);
router.get("/admin/dashboard", protect, authorizePermissions(PERMISSIONS.DASHBOARD_VIEW), getDashboardStats);
router.post("/admin/create", protect, authorizePermissions(PERMISSIONS.ORDER_UPDATE), createAdminOrderController);
router.post("/admin/add-product", protect, authorizePermissions(PERMISSIONS.ORDER_UPDATE), addProductToOrderController);
router.put("/admin/update-quantity", protect, authorizePermissions(PERMISSIONS.ORDER_UPDATE), updateOrderItemQuantityController);
router.delete("/admin/remove-product", protect, removeProductFromOrderController);
router.put("/admin/confirm", protect, confirmOrderController);

// ======================================================
// SPECIFIC ORDER ROUTES
// ======================================================
router.post("/checkout", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);

router.get("/:orderId/details",protect,getOrderDetailsController);
router.get("/:orderId/invoice", protect, generateInvoice);
router.put("/:id/shipping", protect, updateShippingController);
router.put("/:id/status", protect, updateOrderStatusController);

// ======================================================
// ADDRESS MANAGEMENT
// ======================================================
router.post("/addresses", protect, AddressController.addAddress);
router.get("/addresses", protect, AddressController.getMyAddresses);
router.put("/addresses/:id", protect, AddressController.updateAddress);
router.delete("/addresses/:id", protect, AddressController.deleteAddress);

// ======================================================
// SINGLE ORDER (ALWAYS KEEP LAST)
// ======================================================
router.get("/:id", protect, getSingleOrder);

export default router;