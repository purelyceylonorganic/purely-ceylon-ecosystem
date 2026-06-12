import { Router } from "express";
import {
  createProductVariant,
  getAllVariants,
  getVariantById,
  updateVariant,
  deleteVariant,
} from "../controllers/productVariant.controller";

const router = Router();

router.post("/", createProductVariant);
router.get("/", getAllVariants);
router.get("/:id", getVariantById);
router.put("/:id", updateVariant);
router.delete("/:id", deleteVariant);

export default router;