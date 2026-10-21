import { Router } from "express";
import { getProductsSitemap } from "../controllers/sitemap.controller";

const router = Router();

router.get("/sitemap-products.xml", getProductsSitemap);

export default router;