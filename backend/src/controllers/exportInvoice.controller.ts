import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";

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

export const downloadExportInvoicePdf = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.exportInvoice.findUnique({
      where: { id },
      include: {
        bulkOrder: {
          include: {
            buyer: true,
            shipment: true
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Export Invoice not found"
      });
    }

    const doc = new PDFDocument({
      margin: 50
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(22)
      .text("PURELY CEYLON ORGANIC (PVT) LTD", {
        align: "center"
      });

    doc.moveDown();

    doc.fontSize(18)
      .text("EXPORT COMMERCIAL INVOICE", {
        align: "center"
      });

    doc.moveDown(2);

    doc.fontSize(12);

    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Invoice Date: ${invoice.invoiceDate.toDateString()}`);

    doc.moveDown();

    doc.text(
      `Buyer: ${
        invoice.bulkOrder.buyer?.name || "N/A"
      }`
    );

    doc.text(
      `Buyer Email: ${
        invoice.bulkOrder.buyer?.email || "N/A"
      }`
    );

    doc.moveDown();

    doc.text(`Currency: ${invoice.currency}`);
    doc.text(`Subtotal: ${invoice.subtotal}`);
    doc.text(`Tax: ${invoice.tax}`);
    doc.text(`Shipping Cost: ${invoice.shippingCost}`);

    doc.moveDown();

    doc.fontSize(16)
      .text(
        `TOTAL: ${invoice.totalAmount} ${invoice.currency}`
      );

    if (invoice.bulkOrder.shipment) {
      doc.moveDown();

      doc.fontSize(14)
        .text("Shipment Information");

      doc.fontSize(12);

      doc.text(
        `Shipment Number: ${invoice.bulkOrder.shipment.shipmentNumber}`
      );

      doc.text(
        `Tracking Number: ${
          invoice.bulkOrder.shipment.trackingNumber || "N/A"
        }`
      );

      doc.text(
        `Destination Port: ${invoice.bulkOrder.shipment.destinationPort}`
      );
    }

    doc.moveDown(3);

    doc.text(
      "Generated by Purely Ceylon Export Management System",
      {
        align: "center"
      }
    );

    doc.end();

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};