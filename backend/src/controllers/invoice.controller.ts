import PDFDocument from "pdfkit";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
        userId: user.id || user.userId
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
        message: "❌ Order not found"
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

    doc.text(`Customer: ${order.user.fullName}`);
    doc.text(`Email: ${order.user.email}`);
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
        `${item.productVariant.sku} | Qty: ${item.quantity} | Price: ${item.price}`
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
    if (order.payments?.length > 0) {
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