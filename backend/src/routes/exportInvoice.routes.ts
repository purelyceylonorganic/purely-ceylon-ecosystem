import express from "express";
import { 
  createExportInvoice, 
  getAllExportInvoices, 
  getExportInvoiceById 
} from "../controllers/exportInvoice.controller";

const router = express.Router();

router.post("/", createExportInvoice);
router.get("/", getAllExportInvoices);
router.get("/:id", getExportInvoiceById);

export default router;