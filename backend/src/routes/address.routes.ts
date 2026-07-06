import { Router } from "express";

import { protect } from "../middlewares/auth.middleware";

import { AddressController } from "../controllers/address.controller";

const router = Router();

// Get My Addresses
router.get(
  "/",
  protect,
  AddressController.getMyAddresses
);

// Add Address
router.post(
  "/",
  protect,
  AddressController.addAddress
);

// Update Address
router.put(
  "/:id",
  protect,
  AddressController.updateAddress
);

// Delete Address
router.delete(
  "/:id",
  protect,
  AddressController.deleteAddress
);

export default router;