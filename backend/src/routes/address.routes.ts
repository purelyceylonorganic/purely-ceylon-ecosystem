import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { AddressController } from "../controllers/address.controller";

const router = Router();

// 📋 1. பயனரின் அனைத்து முகவரிகளையும் பெறுதல் (Get My Addresses)
router.get(
  "/",
  protect,
  AddressController.getMyAddresses
);

// ➕ 2. புதிய முகவரியைச் சேர்த்தல் (Add Address)
router.post(
  "/",
  protect,
  AddressController.addAddress
);

// ✏️ 3. முகவரியைப் புதுப்பித்தல் (Update Address)
router.put(
  "/:id",
  protect,
  AddressController.updateAddress
);

// ❌ 4. முகவரியை நீக்குதல் (Delete Address)
router.delete(
  "/:id",
  protect,
  AddressController.deleteAddress
);

// 📍 5. முதன்மை முகவரியை மாற்றுதல் (Set Default Address)
// பழைய மற்றும் புதிய இரண்டு URL வழிகளுக்கும் ஆதரவு வழங்கப்பட்டுள்ளது
router.patch(
  "/:id/default",
  protect,
  AddressController.setDefaultAddress
);

router.patch(
  "/default/:id",
  protect,
  AddressController.setDefaultAddress
);

export default router;