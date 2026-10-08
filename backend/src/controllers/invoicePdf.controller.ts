import { Response } from "express";
import PDFDocument from "pdfkit";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ROLES } from "../constants/roles";

export const downloadInvoice = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { orderId } = req.params;

    // Authentication check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            productVariant: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Admin / Finance access
    const isPrivilegedUser =
      req.user.role === ROLES.ADMIN ||
      req.user.role === ROLES.SUPER_ADMIN ||
      req.user.role === ROLES.FINANCE;

    // Customer can access only their own invoice
    const isOrderOwner =
      order.userId === req.user.id;

    if (!isPrivilegedUser && !isOrderOwner) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Create PDF
    const doc = new PDFDocument();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.id}.pdf`
    );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    doc.pipe(res);

    doc
      .fontSize(22)
      .text("PURELY CEYLON ORGANIC", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(16)
      .text(`Invoice #${order.id}`);

    doc.text(
      `Date: ${order.createdAt.toDateString()}`
    );

    doc.moveDown();

    doc.text(
      `Customer: ${order.user.fullName}`
    );

    doc.text(
      `Email: ${order.user.email}`
    );

    doc.moveDown();

    doc.text("Items");

    doc.moveDown();

    order.items.forEach((item: any) => {
      doc.text(
        `${item.productVariant.name} x ${item.quantity}`
      );

      doc.text(
        `USD ${item.price}`
      );

      doc.moveDown();
    });

    doc.moveDown();

    doc
      .fontSize(16)
      .text(
        `Total: USD ${order.totalFinal}`,
        {
          align: "right",
        }
      );

    doc.end();
  } catch (error) {
    console.error(
      "Invoice generation failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Invoice generation failed",
    });
  }
};