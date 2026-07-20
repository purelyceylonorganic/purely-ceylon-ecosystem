import { Router } from "express";

import {
ProductImageController
}
from "../controllers/productImage.controller";


import {protect} 
from "../middlewares/auth.middleware";
import { uploadProductImage } from "../middlewares/productUpload.middleware";


const router = Router();



router.post(
  "/upload",
  protect,
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