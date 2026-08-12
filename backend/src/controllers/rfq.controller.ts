import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validateMOQ } from "../utils/moqValidator";
import { calculateTierPrice } from "../utils/tierPricing";
import { sendRFQSubmittedNotification } from "../services/notification";
import { createAuditLog } from "../services/audit";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { MODULES } from "../constants/modules";

const prisma = new PrismaClient();

// ======================================
// 📩 1. CREATE RFQ (BUYER)
// ======================================
export const createRFQ = async (req: Request, res: Response) => {
  try {
    const buyer = (req as any).user;
    console.log("JWT User:", buyer);

    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "RFQ items required",
      });
    }

    // MOQ Validation
    await validateMOQ(items);

    // Fetch WholesaleBuyer
    const wholesaleBuyer = await prisma.wholesaleBuyer.findUnique({
      where: { email: buyer.email },
    });

    if (!wholesaleBuyer) {
      return res.status(404).json({
        success: false,
        message: "Wholesale buyer account not found",
      });
    }

    // Create RFQ
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
      include: { items: true },
    });

    // Safe Notification
    try {
      await sendRFQSubmittedNotification(
        buyer.email,
        wholesaleBuyer.name || "Wholesale Buyer"
      );
    } catch (notifError) {
      console.error("Notification Error (RFQ):", notifError);
    }

    // Safe Audit Log
    try {
      await createAuditLog({
        userId: wholesaleBuyer.id,
        userEmail: wholesaleBuyer.email,
        action: AUDIT_ACTIONS.RFQ_CREATED,
        module: MODULES.RFQ,
        entityId: rfq.id,
        description: "Wholesale RFQ submitted",
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined,
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

// ======================================
// 📄 2. GET ALL MY RFQs (BUYER)
// ======================================
export const getMyRFQs = async (req: Request, res: Response) => {
  try {
    const buyer = (req as any).user;

    const wholesaleBuyer = await prisma.wholesaleBuyer.findUnique({
      where: { email: buyer.email },
    });

    if (!wholesaleBuyer) {
      return res.status(404).json({
        success: false,
        message: "Wholesale buyer not found",
      });
    }

    const rfqs = await prisma.rFQ.findMany({
      where: { buyerId: wholesaleBuyer.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
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

// ======================================
// 🔍 3. GET SINGLE RFQ (LOGGED USER ADDED)
// ======================================
export const getRFQById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    console.log("Logged User:", user); // 👈 சேர்க்கப்பட்டது!

    const { id } = req.params;

    let buyerFilter: string | undefined = undefined;

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
        buyerId: buyerFilter,
      },
      include: { items: true },
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

// ======================================
// 📋 4. GET PENDING RFQs (ADMIN)
// ======================================
export const getPendingRFQs = async (req: Request, res: Response) => {
  try {
    const rfqs = await prisma.rFQ.findMany({
      where: { status: "PENDING" },
      include: { items: true, buyer: true },
      orderBy: { createdAt: "desc" },
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

// ======================================
// 📩 5. ADMIN SEND QUOTE
// ======================================
export const quoteRFQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quotedPrice, quoteNote } = req.body;

    const rfq = await prisma.rFQ.findUnique({ where: { id } });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
    }

    const buyer = await prisma.wholesaleBuyer.findUnique({
      where: { id: rfq.buyerId },
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    const pricing = calculateTierPrice(quotedPrice, buyer.tier);

    const updatedRFQ = await prisma.rFQ.update({
      where: { id },
      data: {
        quotedPrice: pricing.finalPrice,
        quoteNote,
        quotedAt: new Date(),
        status: "QUOTED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Quote sent successfully",
      data: {
        rfq: updatedRFQ,
        tier: buyer.tier,
        originalPrice: pricing.originalPrice,
        discount: pricing.discount,
        finalPrice: pricing.finalPrice,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// ✅ 6. ACCEPT QUOTE (LOGS & TRANSACTION ADDED)
// ======================================
export const acceptQuote = async (req: Request, res: Response) => {
  try {
    console.log("Logged User:", (req as any).user); // 👈 சேர்க்கப்பட்டது!
    console.log("RFQ ID:", req.params.id); // 👈 சேர்க்கப்பட்டது!

    const { id } = req.params;

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
    }

    if (rfq.status !== "QUOTED") {
      return res.status(400).json({
        success: false,
        message: "Only quoted RFQs can be accepted",
      });
    }

    // Prevent Duplicate Bulk Order
    const existingOrder = await prisma.bulkOrder.findFirst({
      where: { rfqId: rfq.id },
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Bulk Order already exists for this RFQ",
      });
    }

    // Atomic Transaction: Create Bulk Order & Update RFQ Status
    const result = await prisma.$transaction(async (tx) => {
      const bulkOrder = await tx.bulkOrder.create({
        data: {
          buyerId: rfq.buyerId,
          rfqId: rfq.id,
          totalAmount: rfq.quotedPrice || 0,
          status: "PENDING",
          paymentStatus: "UNPAID",
          items: {
            create: rfq.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: rfq.quotedPrice && rfq.items.length > 0 
                ? rfq.quotedPrice / rfq.items.length 
                : 0,
            })),
          },
        },
        include: { items: true },
      });

      const updatedRFQ = await tx.rFQ.update({
        where: { id },
        data: {
          status: "ACCEPTED",
          bulkOrderId: bulkOrder.id,
        },
      });

      return { bulkOrder, updatedRFQ };
    });

    return res.status(200).json({
      success: true,
      message: "Quote accepted and Bulk Order created successfully",
      data: {
        rfqId: result.updatedRFQ.id,
        bulkOrderId: result.bulkOrder.id,
        status: result.updatedRFQ.status,
        totalAmount: result.bulkOrder.totalAmount,
      },
    });
  } catch (error: any) {
    console.error("Error in acceptQuote:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// ❌ 7. REJECT QUOTE
// ======================================
export const rejectQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rfq = await prisma.rFQ.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return res.status(200).json({
      success: true,
      message: "Quote rejected successfully",
      data: rfq,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// ❌ 8. CANCEL RFQ
// ======================================
export const cancelRFQ = async (req: Request, res: Response) => {
  try {
    const buyer = (req as any).user;
    const { id } = req.params;

    const wholesaleBuyer = await prisma.wholesaleBuyer.findUnique({
      where: { email: buyer.email },
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
      data: { status: "CANCELLED" },
    });

    // Audit Log
    try {
      await createAuditLog({
        userId: wholesaleBuyer.id,
        userEmail: wholesaleBuyer.email,
        action: AUDIT_ACTIONS.RFQ_CANCELLED,
        module: MODULES.RFQ,
        entityId: updated.id,
        description: "RFQ cancelled",
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined,
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