import express from "express";
import {
  createExportDocument,
  getAllExportDocuments,
  getExportDocumentById,
  updateExportDocumentStatus
} from "../controllers/exportDocument.controller";

const router = express.Router();

// Create
router.post("/", createExportDocument);

// Get All
router.get("/", getAllExportDocuments);

// Get Single
router.get("/:id", getExportDocumentById);

// Update Status
router.patch("/:id/status", updateExportDocumentStatus);

export default router;