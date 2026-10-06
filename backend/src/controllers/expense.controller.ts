import { Request, Response } from "express";
import {
  PrismaClient,
  ExpenseCategory,
} from "@prisma/client";

import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../validators/expense.validation";

const prisma = new PrismaClient();

// =====================================================
// CREATE EXPENSE
// =====================================================

export const createExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = createExpenseSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const {
      category,
      description,
      amount,
      currency,
      expenseDate,
      reference,
      notes,
    } = parsed.data;

    // Validate category
    if (
      !Object.values(ExpenseCategory).includes(
        category as ExpenseCategory
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense category",
      });
    }

    const expense = await prisma.expense.create({
      data: {
        category: category as ExpenseCategory,
        description,
        amount: Number(amount),

        ...(currency !== undefined && {
          currency,
        }),

        ...(expenseDate !== undefined && {
          expenseDate: new Date(expenseDate),
        }),

        ...(reference !== undefined && {
          reference,
        }),

        ...(notes !== undefined && {
          notes,
        }),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });

  } catch (error) {
    console.error("Create Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating expense",
    });
  }
};


// =====================================================
// GET ALL EXPENSES
// =====================================================

export const getAllExpenses = async (
  req: Request,
  res: Response
) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        expenseDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });

  } catch (error) {
    console.error("Get Expenses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching expenses",
    });
  }
};


// =====================================================
// GET SINGLE EXPENSE
// =====================================================

export const getExpenseById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: {
        id,
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: expense,
    });

  } catch (error) {
    console.error("Get Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching expense",
    });
  }
};


// =====================================================
// UPDATE EXPENSE
// =====================================================

export const updateExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const parsed = updateExpenseSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const existingExpense =
      await prisma.expense.findUnique({
        where: { id },
      });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const {
      category,
      description,
      amount,
      currency,
      expenseDate,
      reference,
      notes,
    } = parsed.data;

    const data: {
      category?: ExpenseCategory;
      description?: string;
      amount?: number;
      currency?: string;
      expenseDate?: Date;
      reference?: string | null;
      notes?: string | null;
    } = {};

    if (category !== undefined) {
      if (
        !Object.values(ExpenseCategory).includes(
          category as ExpenseCategory
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense category",
        });
      }

      data.category =
        category as ExpenseCategory;
    }

    if (description !== undefined) {
      data.description = description;
    }

    if (amount !== undefined) {
      data.amount = Number(amount);
    }

    if (currency !== undefined) {
      data.currency = currency;
    }

    if (expenseDate !== undefined) {
      data.expenseDate =
        new Date(expenseDate);
    }

    if (reference !== undefined) {
      data.reference = reference;
    }

    if (notes !== undefined) {
      data.notes = notes;
    }

    const expense = await prisma.expense.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });

  } catch (error) {
    console.error("Update Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating expense",
    });
  }
};


// =====================================================
// DELETE EXPENSE
// =====================================================

export const deleteExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const existingExpense =
      await prisma.expense.findUnique({
        where: { id },
      });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await prisma.expense.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });

  } catch (error) {
    console.error("Delete Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error deleting expense",
    });
  }
};