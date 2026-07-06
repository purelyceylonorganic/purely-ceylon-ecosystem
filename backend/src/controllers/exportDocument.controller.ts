import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createAuditLog } from "../services/audit";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { MODULES } from "../constants/modules";

const prisma = new PrismaClient();

// 1. Create Export Document
export const createExportDocument = async (req: Request, res: Response) => {
  try {
    const { bulkOrderId, billOfLading, customsReference } = req.body;

    const order = await prisma.bulkOrder.findUnique({
      where: { id: bulkOrderId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Bulk Order not found"
      });
    }

    const document = await prisma.exportDocument.create({
      data: {
        bulkOrderId,
        commercialInvoice: true,
        packingList: true,
        certificateOfOrigin: true,
        billOfLading,
        customsReference,
        status: "READY"
      }
    });

    // ✅ Safe Audit Log Call after document creation
    try {
      await createAuditLog({
        action: AUDIT_ACTIONS.EXPORT_DOCUMENT_GENERATED,
        module: MODULES.EXPORT,
        entityId: document.id,
        description: "Export document generated",
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined
      });
    } catch (auditError) {
      console.error("Audit Log Error (Export Document Generated):", auditError);
    }

    return res.status(201).json({
      success: true,
      message: "Export Documents Created",
      data: document
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Get All Export Documents
export const getAllExportDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await prisma.exportDocument.findMany({
      include: {
        bulkOrder: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Get Single Export Document by ID
export const getExportDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const document = await prisma.exportDocument.findUnique({
      where: { id },
      include: { bulkOrder: true }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: document
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Update Export Document Status
export const updateExportDocumentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.exportDocument.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json({
      success: true,
      message: "Document Updated",
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};