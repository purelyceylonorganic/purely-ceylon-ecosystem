import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { protect } from "../middlewares/auth.middleware";
import { uploadProfilePhoto } from "../middlewares/upload.middleware";


const router = Router();


router.post(
"/product-image",
protect,
uploadProfilePhoto.single("image"),
UploadController.uploadProductImage
);


export default router;