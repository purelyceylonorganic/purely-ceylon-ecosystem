import { Router } from "express";

import {
ProductImageController
}
from "../controllers/productImage.controller";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";


import {protect} 
from "../middlewares/auth.middleware";
import { uploadProductImage } from "../middlewares/productUpload.middleware";


const router = Router();


router.post(
  "/upload",
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_UPDATE),
  uploadProductImage.array("images", 10),
  ProductImageController.uploadImage
);
router.patch(
  "/:id/primary",
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_UPDATE),
  ProductImageController.setPrimaryImage
);
router.delete(
  "/:id",
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_DELETE),
  ProductImageController.deleteImage
);
router.put(
  "/:id/primary",
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_UPDATE),
  ProductImageController.setPrimary
);

router.post(
  "/upload",
  protect,
  authorizePermissions(PERMISSIONS.PRODUCT_UPDATE),
  uploadProductImage.array("images", 10),
  ProductImageController.uploadImage
);



router.get(
"/:productId",
ProductImageController.getImages
);

router.patch(
"/:id/primary",
protect,
ProductImageController.setPrimaryImage
);

router.delete(
"/:id",
protect,
ProductImageController.deleteImage
);

router.put(
  "/:id/primary",
  protect,
  ProductImageController.setPrimary
);


export default router;