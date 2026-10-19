import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
  createIncomeSchema,
  updateIncomeSchema,
} from "../validators/income.validation";

// =====================================================
// CREATE INCOME (Add Revenue)
// =====================================================
export const createIncome = async (req: Request, res: Response) => {
  try {
    const parsed = createIncomeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const { incomeDate, ...rest } = parsed.data;

    const income = await prisma.income.create({
      data: {
        ...rest,
        ...(incomeDate !== undefined && { incomeDate: new Date(incomeDate) }),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Income created successfully",
      data: income,
    });
  } catch (error) {
    console.error("Create Income Error:", error);
    return res.status(500).json({ success: false, message: "Error creating income" });
  }
};

// =====================================================
// GET ALL INCOME
// =====================================================
export const getAllIncome = async (_req: Request, res: Response) => {
  try {
    const income = await prisma.income.findMany({
      orderBy: { incomeDate: "desc" },
    });

    return res.status(200).json({ success: true, data: income });
  } catch (error) {
    console.error("Get Income Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching income" });
  }
};

// =====================================================
// UPDATE INCOME
// =====================================================
export const updateIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updateIncomeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const existing = await prisma.income.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Income not found" });
    }

    const { incomeDate, ...rest } = parsed.data;

    const income = await prisma.income.update({
      where: { id },
      data: {
        ...rest,
        ...(incomeDate !== undefined && { incomeDate: new Date(incomeDate) }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Income updated successfully",
      data: income,
    });
  } catch (error) {
    console.error("Update Income Error:", error);
    return res.status(500).json({ success: false, message: "Error updating income" });
  }
};

// =====================================================
// DELETE INCOME
// =====================================================
export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.income.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Income not found" });
    }

    await prisma.income.delete({ where: { id } });

    return res.status(200).json({ success: true, message: "Income deleted successfully" });
  } catch (error) {
    console.error("Delete Income Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting income" });
  }
};