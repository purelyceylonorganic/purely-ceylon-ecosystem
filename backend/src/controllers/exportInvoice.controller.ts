import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `INV-${year}-${random}`;
};

export const createExportInvoice = async (req: Request, res: Response) => {
  try {
    const { bulkOrderId } = req.body;

    // 1️⃣ Fetch Bulk Order
    const order = await prisma.bulkOrder.findUnique({
      where: { id: bulkOrderId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Bulk Order not found"
      });
    }

    // 2️⃣ Prevent duplicate conversion (முதலிலேயே சோதிக்கப்பட வேண்டும்)
    const existingInvoice = await prisma.exportInvoice.findFirst({
      where: { bulkOrderId }
    });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: "Export Invoice already exists for this Bulk Order"
      });
    }

    // 3️⃣ Export Status Workflow Validation
    const allowedExportStatuses = ["READY_FOR_EXPORT", "CUSTOMS_CLEARANCE", "SHIPPED"];
    if (!allowedExportStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Invoice can only be created for export-ready orders. Current status: ${order.status}`
      });
    }

    // 4️⃣ Create Export Invoice
    const invoice = await prisma.exportInvoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        bulkOrderId,
        subtotal: order.totalAmount,
        totalAmount: order.totalAmount
      }
    });

    return res.status(201).json({
      success: true,
      message: "Export Invoice Created Successfully under Purely Ceylon Organic (Pvt) Ltd commercial standard",
      data: invoice
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExportInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.exportInvoice.findUnique({
      where: { id },
      include: {
        bulkOrder: true
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllExportInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.exportInvoice.findMany({
      include: {
        bulkOrder: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      data: invoices
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};