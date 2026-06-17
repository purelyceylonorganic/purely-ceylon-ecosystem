import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validateMOQ } from "../utils/moqValidator";

const prisma = new PrismaClient();


// ===============================
// 📩 CREATE RFQ
// ===============================
export const createRFQ = async (req: Request, res: Response) => {
  try {

    const buyer = (req as any).user;

    console.log("JWT User:", buyer);

    const { items } = req.body;

    // ❌ validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "RFQ items required",
      });
    }

    // 🧠 MOQ VALIDATION (IMPORTANT)
    await validateMOQ(items);

    // 🔍 WholesaleBuyer find
    const wholesaleBuyer = await prisma.wholesaleBuyer.findUnique({
      where: {
        email: buyer.email,
      },
    });

    if (!wholesaleBuyer) {
      return res.status(404).json({
        success: false,
        message: "Wholesale buyer account not found",
      });
    }

    // 📩 CREATE RFQ
    const rfq = await prisma.rFQ.create({
      data: {
        buyerId: wholesaleBuyer.id,
        status: "PENDING",

        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "RFQ created successfully",
      data: rfq,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// 📄 GET ALL RFQs (BUYER)
// ===============================
export const getMyRFQs = async (req: Request, res: Response) => {
  try {

    const buyer = (req as any).user;

    const wholesaleBuyer = await prisma.wholesaleBuyer.findUnique({
      where: {
        email: buyer.email,
      },
    });

    if (!wholesaleBuyer) {
      return res.status(404).json({
        success: false,
        message: "Wholesale buyer not found",
      });
    }

    const rfqs = await prisma.rFQ.findMany({
      where: {
        buyerId: wholesaleBuyer.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: rfqs,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// 🔍 GET SINGLE RFQ
// ===============================
export const getRFQById = async (req: Request, res: Response) => {
  try {

    const buyer = (req as any).user;
    const { id } = req.params;

    const wholesaleBuyer = await prisma.wholesaleBuyer.findUnique({
      where: {
        email: buyer.email,
      },
    });

    if (!wholesaleBuyer) {
      return res.status(404).json({
        success: false,
        message: "Wholesale buyer not found",
      });
    }

    const rfq = await prisma.rFQ.findFirst({
      where: {
        id,
        buyerId: wholesaleBuyer.id,
      },
      include: {
        items: true,
      },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rfq,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// ❌ CANCEL RFQ
// ===============================
export const cancelRFQ = async (req: Request, res: Response) => {
  try {

    const buyer = (req as any).user;
    const { id } = req.params;

    const wholesaleBuyer = await prisma.wholesaleBuyer.findUnique({
      where: {
        email: buyer.email,
      },
    });

    if (!wholesaleBuyer) {
      return res.status(404).json({
        success: false,
        message: "Wholesale buyer not found",
      });
    }

    const rfq = await prisma.rFQ.findFirst({
      where: {
        id,
        buyerId: wholesaleBuyer.id,
      },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
    }

    const updated = await prisma.rFQ.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "RFQ cancelled successfully",
      data: updated,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};