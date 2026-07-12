import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  updateOrderStatusController,
  getAllOrders,
  updateShippingController,
  getDashboardStats,
} from "../controllers/order.controller";

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
// ORDER MANAGEMENT
// ======================================================

// Checkout
router.post(
  "/checkout",
  protect,
  placeOrder
);

// My Orders
router.get(
  "/my-orders",
  protect,
  getMyOrders
);

// ======================================================
// ADDRESS MANAGEMENT
// ======================================================

// Add Address
router.post(
  "/addresses",
  protect,
  AddressController.addAddress
);

// Get Addresses
router.get(
  "/addresses",
  protect,
  AddressController.getMyAddresses
);

// Update Address
router.put(
  "/addresses/:id",
  protect,
  AddressController.updateAddress
);

// Delete Address
router.delete(
  "/addresses/:id",
  protect,
  AddressController.deleteAddress
);

// ======================================================
// SINGLE ORDER
// IMPORTANT: ALWAYS KEEP LAST
// ======================================================
router.put(
  "/:id/shipping",
  protect,
  updateShippingController
);

router.put(
  "/:id/status",
  protect,
  updateOrderStatusController
);

router.get(
  "/admin/all",
  protect,
  getAllOrders
);

router.get(
  "/:orderId/invoice",
  protect,
  generateInvoice
);

router.get(
  "/:id",
  protect,
  getSingleOrder
);

router.get(
  "/admin/dashboard",
  protect,
  getDashboardStats
);

export default router;