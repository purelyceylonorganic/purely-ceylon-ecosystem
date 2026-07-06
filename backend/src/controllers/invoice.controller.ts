import PDFDocument from "pdfkit";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createAuditLog } from "../services/audit";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { MODULES } from "../constants/modules";

const prisma = new PrismaClient();

// ===============================
// 📄 GENERATE INVOICE PDF (FINAL)
// ===============================
export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { orderId } = req.params;

    // ===============================
    // 1. GET ORDER (SAFE + FULL DATA)
    // ===============================
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        // 🚀 பயனர் CUSTOMER ஆக இருந்தால் சொந்த இன்வாய்ஸ் மட்டும், ADMIN/FINANCE எனில் எல்லாவற்றையும் பார்க்கலாம்
        userId: user.role === "CUSTOMER" ? (user.id || user.userId) : undefined
      },
      include: {
        items: {
          include: {
            productVariant: true
          }
        },
        payments: true,
        user: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "❌ Order not found or Unauthorized"
      });
    }

    // ===============================
    // 2. PDF SETUP
    // ===============================
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.id}.pdf`
    );

    doc.pipe(res);

    // ===============================
    // 🏢 COMPANY HEADER
    // ===============================
    doc.fontSize(24).text("PURELY CEYLON", {
      align: "center"
    });

    doc.moveDown();
    doc.fontSize(18).text("INVOICE", {
      align: "center"
    });

    doc.moveDown(2);

    // ===============================
    // 👤 CUSTOMER INFO
    // ===============================
    doc.fontSize(12);

    doc.text(`Customer: ${order.user?.fullName || "N/A"}`);
    doc.text(`Email: ${order.user?.email || "N/A"}`);
    doc.text(`Order ID: ${order.id}`);
    doc.text(`Currency: ${order.currency}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);

    doc.moveDown(2);

    // ===============================
    // 📦 ITEMS LIST (VARIANT BASED)
    // ===============================
    doc.fontSize(14).text("ORDER ITEMS");
    doc.moveDown();

    order.items.forEach((item) => {
      doc.fontSize(12).text(
        `${item.productVariant?.sku || "Unknown SKU"} | Qty: ${item.quantity} | Price: ${item.price}`
      );
    });

    doc.moveDown(2);

    // ===============================
    // 💰 TOTAL BREAKDOWN
    // ===============================
    doc.fontSize(14).text("SUMMARY");
    doc.moveDown();

    doc.fontSize(12);

    doc.text(`Subtotal (USD): ${order.totalUSD}`);
    doc.text(`Tax: ${order.taxAmount}`);
    doc.text(`Shipping: ${order.shippingCost}`);
    doc.text(`Exchange Rate: ${order.exchangeRate}`);

    doc.moveDown();

    doc.fontSize(16).text(
      `TOTAL: ${order.totalFinal} ${order.currency}`
    );

    doc.moveDown(2);

    // ===============================
    // 💳 PAYMENT INFO
    // ===============================
    if (order.payments && order.payments.length > 0) {
      const payment = order.payments[0];

      doc.fontSize(12).text("PAYMENT INFO");
      doc.text(`Gateway: ${payment.gateway}`);
      doc.text(`Transaction ID: ${payment.transactionId}`);
    }

    doc.moveDown(3);

    // ===============================
    // ❤️ FOOTER
    // ===============================
    doc.fontSize(12).text(
      "Thank you for shopping with Purely Ceylon 🌿",
      {
        align: "center"
      }
    );

    // ✅ Safe Audit Log Call before ending doc stream (User ID சேர்க்கப்பட்டுள்ளது)
    try {
      await createAuditLog({
        userId: user?.id, // 👈 லாக்-இன் செய்த பயனர் ID இணைக்கப்பட்டுள்ளது
        action: AUDIT_ACTIONS.EXPORT_INVOICE_GENERATED,
        module: MODULES.EXPORT,
        entityId: order.id,
        description: `Export Invoice generated for order ${order.id}`,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined
      });
    } catch (auditError) {
      console.error("Audit Log Error (Invoice Generated):", auditError);
    }

    // ===============================
    // END PDF
    // ===============================
    doc.end();

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "❌ Invoice generation failed"
    });
  }
};