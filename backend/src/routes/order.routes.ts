import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getSingleOrder,
} from "../controllers/order.controller";

import { AddressController } from "../controllers/address.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

console.log("✅ order.routes.ts loaded");

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

router.get(
  "/:id",
  protect,
  getSingleOrder
);

export default router;