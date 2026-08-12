import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { calculateTierPrice } from "../utils/tierPricing";

const prisma = new PrismaClient();

// ======================================
// 📩 1. ADMIN SEND QUOTE
// ======================================
export const quoteRFQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quotedPrice, quoteNote } = req.body;

    // Fetch RFQ
    const rfq = await prisma.rFQ.findUnique({
      where: { id },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
    }

    // Fetch Buyer Details
    const buyer = await prisma.wholesaleBuyer.findUnique({
      where: { id: rfq.buyerId },
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    // Tier Pricing Calculation
    const pricing = calculateTierPrice(quotedPrice, buyer.tier);

    // Update RFQ with Quoted Details
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
    console.error("Error in quoteRFQ:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================
// 📋 2. GET PENDING RFQs
// ======================================
export const getPendingRFQs = async (req: Request, res: Response) => {
  try {
    const rfqs = await prisma.rFQ.findMany({
      where: { status: "PENDING" },
      include: {
        items: true,
        buyer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: rfqs,
    });
  } catch (error: any) {
    console.error("Error in getPendingRFQs:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================
// ✅ 3. ACCEPT QUOTE (CREATE BULK ORDER)
// ======================================
export const acceptQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch RFQ with items
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

    // Status Validation
    if (rfq.status !== "QUOTED") {
      return res.status(400).json({
        success: false,
        message: "Only quoted RFQs can be accepted",
      });
    }

    // Prevent duplicate Bulk Order creation
    const existingOrder = await prisma.bulkOrder.findFirst({
      where: { rfqId: rfq.id },
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Bulk Order already exists for this RFQ",
      });
    }

    // 🔄 Atomic Transaction: BulkOrder creation & RFQ status update
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Create Bulk Order and map items
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
              // Distribute quoted price per item safely
              price: rfq.quotedPrice && rfq.items.length > 0 
                ? rfq.quotedPrice / rfq.items.length 
                : 0,
            })),
          },
        },
        include: { items: true },
      });

      // Step B: Update RFQ status to ACCEPTED and link bulkOrderId
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
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================
// ❌ 4. REJECT QUOTE
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
    console.error("Error in rejectQuote:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};