import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validateMOQ } from "../utils/moqValidator";
import { sendRFQSubmittedNotification } from "../services/notification";
import { createAuditLog } from "../services/audit";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { MODULES } from "../constants/modules";

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

    // ✅ Safe Notification using DB records
    try {
      await sendRFQSubmittedNotification(
        buyer.email,
        wholesaleBuyer.name || "Wholesale Buyer"
      );
    } catch (notifError) {
      console.error("Notification Error (RFQ):", notifError);
    }

    // ✅ Safe Audit Log
    try {
      await createAuditLog({
        userId: wholesaleBuyer.id,
        userEmail: wholesaleBuyer.email,
        action: AUDIT_ACTIONS.RFQ_CREATED,
        module: MODULES.RFQ,
        entityId: rfq.id,
        description: "Wholesale RFQ submitted",
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined
      });
    } catch (auditError) {
      console.error("Audit Log Error (RFQ Created):", auditError);
    }

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
// 🔍 GET SINGLE RFQ (With Admin Override)
// ===============================
export const getRFQById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    let buyerFilter: string | undefined = undefined;

    // லாக்-இன் செய்தவர் BUYER ஆக இருந்தால் மட்டும் ஓனர்ஷிப் செக் செய்கிறோம்
    if (user.role === "BUYER") {
      const wholesaleBuyer = await prisma.wholesaleBuyer.findUnique({
        where: { email: user.email },
      });

      if (!wholesaleBuyer) {
        return res.status(404).json({
          success: false,
          message: "Wholesale buyer not found",
        });
      }
      buyerFilter = wholesaleBuyer.id;
    }

    const rfq = await prisma.rFQ.findFirst({
      where: {
        id,
        buyerId: buyerFilter, // 🚀 BUYER எனில் சொந்த ID, ADMIN எனில் undefined (எல்லா RFQ-ம் தெரியும்)
      },
      include: {
        items: true,
      },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found or Unauthorized",
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

    // ✅ Safe Audit Log Call after DB update (As per standards)
    try {
      await createAuditLog({
        userId: wholesaleBuyer.id,
        userEmail: wholesaleBuyer.email,
        action: AUDIT_ACTIONS.RFQ_CANCELLED,
        module: MODULES.RFQ,
        entityId: updated.id,
        description: "RFQ cancelled",
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined
      });
    } catch (auditError) {
      console.error("Audit Log Error (RFQ Cancelled):", auditError);
    }

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