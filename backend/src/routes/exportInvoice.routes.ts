import express from "express";
import { 
  createExportInvoice, 
  getAllExportInvoices, 
  getExportInvoiceById,
  downloadExportInvoicePdf
} from "../controllers/exportInvoice.controller";

const router = express.Router();

router.post("/", createExportInvoice);
router.get("/", getAllExportInvoices);
router.get("/:id/pdf", downloadExportInvoicePdf);
router.get("/:id", getExportInvoiceById);

export default router;