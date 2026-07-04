import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==============================
// Ask Question
// ==============================
export const askQuestion = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { productId } = req.params;
    const { question } = req.body;

    const newQuestion = await prisma.question.create({
      data: {
        question,
        productId,
        userId: user.id,
      },
    });

    return res.json({
      success: true,
      message: "Question added successfully",
      question: newQuestion,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Product Questions
// ==============================
export const getProductQuestions = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const questions = await prisma.question.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      questions,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Seller Answer
// ==============================
export const answerQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const updated = await prisma.question.update({
      where: {
        id,
      },
      data: {
        answer,
      },
    });

    return res.json({
      success: true,
      message: "Answer added successfully",
      question: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// ✅ Delete Question (புதிதாக சேர்க்கப்பட்டது)
// ==============================
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.question.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};