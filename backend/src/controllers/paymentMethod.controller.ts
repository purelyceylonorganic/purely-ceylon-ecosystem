import { Request, Response } from "express";
import { prisma } from "../config/prisma";

// 1. கார்டைச் சேமிக்கும் POST API
export const addPaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Frontend-லிருந்து வரும் தரவுகள்
    const {
      brand,
      cardLast4,
      stripePaymentMethodId,
      cardHolderName,
      expiryMonth,
      expiryYear
    } = req.body;

    const card = await prisma.savedPaymentMethod.create({
      data: {
        userId,
        brand,
        cardLast4,
        stripePaymentMethodId, // Stripe-ன் முக்கிய ID
        cardHolderName,
        expiryMonth: Number(expiryMonth),
        expiryYear: Number(expiryYear),
      },
    });

    res.status(201).json({
      success: true,
      data: card
    });
  } catch (error) {
    console.error("Add Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add payment method"
    });
  }
};

// 2. கார்டுகளைப் பார்க்கும் GET API
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const cards = await prisma.savedPaymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    res.json({
      success: true,
      data: cards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load payment methods"
    });
  }
};

// 3. கார்டை நீக்கும் DELETE API
export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.savedPaymentMethod.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Payment method deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
};

// 4. Default கார்டை அமைக்கும் PUT API
export const setDefaultPaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // முதலில் பயனரின் மற்ற அனைத்து கார்டுகளையும் false ஆக்குங்கள்
    await prisma.savedPaymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    // தேர்ந்தெடுக்கப்பட்ட கார்டை மட்டும் true ஆக்குங்கள்
    await prisma.savedPaymentMethod.update({
      where: { id },
      data: { isDefault: true }
    });

    res.json({
      success: true,
      message: "Default payment method updated"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update default card"
    });
  }
};