import { Router } from "express";

import {
  getOptionsController,
  testOptionsController,
  getConfigController,
  seedController,
  createZoneController,
  updateZoneController,
  deleteZoneController,
  createMethodController,
  updateMethodController,
  deleteMethodController,
  saveZoneMethodController,
} from "../controllers/ShippingSettings.controller";

import { protect, restrictTo } from "../middlewares/auth.middleware";

const router = Router();

// 🛒 Checkout / Cart-க்கு (login கட்டாயமில்லை; விலை மற்றும் எடை server-ல் கணக்கிடப்படும்)
router.post("/options", getOptionsController);

// 🔒 நிர்வாகம்
router.use(protect, restrictTo("SUPER_ADMIN", "ADMIN", "EXPORT_MANAGER"));

router.get("/config", getConfigController);
router.post("/test", testOptionsController);
router.post("/seed", seedController);

router.post("/zones", createZoneController);
router.put("/zones/:id", updateZoneController);
router.delete("/zones/:id", deleteZoneController);

router.post("/methods", createMethodController);
router.put("/methods/:id", updateMethodController);
router.delete("/methods/:id", deleteMethodController);

router.put("/zone-methods", saveZoneMethodController);

export default router;