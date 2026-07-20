import { Router } from "express";
import { downloadInvoice } from "../controllers/invoicePdf.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/:orderId/download",
  protect,
  downloadInvoice
);

export default router;