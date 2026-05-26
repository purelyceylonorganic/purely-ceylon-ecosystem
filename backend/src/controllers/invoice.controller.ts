import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();


// 📄 GENERATE INVOICE PDF
export const generateInvoice = async (
  req: Request,
  res: Response
) => {
  try {

    const user = (req as any).user;

    const { orderId } = req.params;

    // ✅ Find Order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.userId
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        payments: true,
        user: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '❌ Order not found'
      });
    }

    // ✅ PDF Setup
    const doc = new PDFDocument({
      margin: 50
    });

    // ✅ Response Headers
    res.setHeader(
      'Content-Type',
      'application/pdf'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${order.id}.pdf`
    );

    doc.pipe(res);

    // 🏢 COMPANY
    doc
      .fontSize(24)
      .text('PURELY CEYLON', {
        align: 'center'
      });

    doc.moveDown();

    // 📄 TITLE
    doc
      .fontSize(18)
      .text('INVOICE', {
        align: 'center'
      });

    doc.moveDown(2);

    // 👤 CUSTOMER DETAILS
    doc.fontSize(12);

    doc.text(`Customer: ${order.user.fullName}`);
    doc.text(`Email: ${order.user.email}`);

    doc.moveDown();

    // 📦 ORDER DETAILS
    doc.text(`Order ID: ${order.id}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.text(`Order Date: ${order.createdAt}`);

    doc.moveDown(2);

    // 📦 ITEMS
    doc
      .fontSize(14)
      .text('Order Items');

    doc.moveDown();

    order.items.forEach((item) => {

      doc.fontSize(12).text(
        `${item.product.name} | Qty: ${item.quantity} | Rs. ${item.price}`
      );

    });

    doc.moveDown(2);

    // 💰 TOTALS
    doc.fontSize(14);

    doc.text(`Tax: Rs. ${order.taxAmount}`);

    doc.text(`Shipping: Rs. ${order.shippingCost}`);

    doc.text(`Total: Rs. ${order.totalAmount}`);

    doc.moveDown(2);

    // 💳 PAYMENT
    if (order.payments.length > 0) {

      const payment = order.payments[0];

      doc.text(`Payment Gateway: ${payment.gateway}`);

      doc.text(`Transaction ID: ${payment.transactionId}`);

    }

    doc.moveDown(3);

    // ❤️ FOOTER
    doc
      .fontSize(12)
      .text(
        'Thank you for shopping with Purely Ceylon 🌿',
        {
          align: 'center'
        }
      );

    // ✅ END PDF
    doc.end();

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: '❌ Invoice generation failed'
    });

  }
};