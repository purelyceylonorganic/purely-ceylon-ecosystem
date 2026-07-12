import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const exportRevenuePDF = async (
  req: Request,
  res: Response
) => {
  try {
    const revenue = await prisma.order.aggregate({
      _sum: {
        totalFinal: true,
      },
    });

    const totalOrders = await prisma.order.count();

    const totalCustomers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    });

    const doc = new PDFDocument();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=revenue-report.pdf"
    );

    doc.pipe(res);

    doc
      .fontSize(22)
      .text("Purely Ceylon Revenue Report");

    doc.moveDown();

    doc.fontSize(14).text(
      `Total Revenue: USD ${
        revenue._sum.totalFinal || 0
      }`
    );

    doc.text(
      `Total Orders: ${totalOrders}`
    );

    doc.text(
      `Total Customers: ${totalCustomers}`
    );

    doc.moveDown();

    doc.text(
      `Generated: ${new Date().toLocaleString()}`
    );

    doc.end();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "PDF Export Failed",
    });
  }
};