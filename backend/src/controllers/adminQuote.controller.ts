import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { calculateTierPrice } from "../utils/tierPricing";

const prisma = new PrismaClient();

// ======================================
// 📩 ADMIN SEND QUOTE
// ======================================
export const quoteRFQ = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      quotedPrice,
      quoteNote
    } = req.body;

    const rfq = await prisma.rFQ.findUnique({
      where: { id }
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found"
      });
    }

    // 👤 Buyer Fetch
    const buyer =
      await prisma.wholesaleBuyer.findUnique({
        where: {
          id: rfq.buyerId
        }
      });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found"
      });
    }

    // 💰 Tier Pricing
    const pricing = calculateTierPrice(
      quotedPrice,
  buyer.tier
);

    // 📝 Update RFQ
    const updatedRFQ =
      await prisma.rFQ.update({
        where: { id },

        data: {
          quotedPrice: pricing.finalPrice,
          quoteNote,
          quotedAt: new Date(),
          status: "QUOTED"
        }
      });

    return res.status(200).json({
      success: true,
      message: "Quote sent successfully",

      data: {
        rfq: updatedRFQ,

        tier: buyer.tier,

        originalPrice:
          pricing.originalPrice,

        discount:
          pricing.discount,

        finalPrice:
          pricing.finalPrice
      }
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ======================================
// 📋 GET PENDING RFQs
// ======================================
export const getPendingRFQs = async (
  req: Request,
  res: Response
) => {

  try {

    const rfqs =
      await prisma.rFQ.findMany({

        where: {
          status: "PENDING"
        },

        include: {
          items: true,
          buyer: true
        },

        orderBy: {
          createdAt: "desc"
        }

      });

    return res.status(200).json({
      success: true,
      data: rfqs
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ======================================
// ✅ ACCEPT QUOTE
// ======================================
export const acceptQuote = async (
  req: Request,
  res: Response
) => {

  try {

    const { id } = req.params;

    const rfq =
      await prisma.rFQ.update({

        where: { id },

        data: {
          status: "ACCEPTED"
        }

      });

    return res.status(200).json({
      success: true,
      message: "Quote accepted",
      data: rfq
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ======================================
// ❌ REJECT QUOTE
// ======================================
export const rejectQuote = async (
  req: Request,
  res: Response
) => {

  try {

    const { id } = req.params;

    const rfq =
      await prisma.rFQ.update({

        where: { id },

        data: {
          status: "REJECTED"
        }

      });

    return res.status(200).json({
      success: true,
      message: "Quote rejected",
      data: rfq
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};