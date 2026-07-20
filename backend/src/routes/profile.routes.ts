import { Router } from "express";
import { uploadProfilePhoto } from "../controllers/profile.controller";
import { uploadProfilePhoto as upload } from "../middlewares/upload.middleware";
import { removeProfilePhoto } from "../controllers/profile.controller";

import {
  getMyProfile,
  updateMyProfile,
  changePassword
} from "../controllers/profile.controller";

import { protect }
  from "../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.get(
  "/me",
  getMyProfile
);

router.put(
  "/update",
  updateMyProfile
);

router.put(
  "/change-password",
  changePassword
);

router.post(
  "/upload-photo",
  upload.single("photo"),
  uploadProfilePhoto
);
router.delete(
  "/remove-photo",
  protect,
  removeProfilePhoto
);
export default router;