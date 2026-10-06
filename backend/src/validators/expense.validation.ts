import { z } from "zod";
import { ExpenseCategory } from "@prisma/client";

// =====================================================
// CREATE EXPENSE VALIDATION
// =====================================================

export const createExpenseSchema = z.object({
  category: z.nativeEnum(ExpenseCategory, {
    message: "Invalid expense category",
  }),

  description: z
    .string()
    .min(2, "Expense description is required"),

  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  currency: z
    .string()
    .min(3, "Currency is required")
    .max(10)
    .optional(),

  expenseDate: z
    .string()
    .optional(),

  reference: z
    .string()
    .optional()
    .nullable(),

  notes: z
    .string()
    .optional()
    .nullable(),
});

// =====================================================
// UPDATE EXPENSE VALIDATION
// =====================================================

export const updateExpenseSchema = z.object({
  category: z
    .nativeEnum(ExpenseCategory)
    .optional(),

  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .optional(),

  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .optional(),

  currency: z
    .string()
    .min(3)
    .max(10)
    .optional(),

  expenseDate: z
    .string()
    .optional(),

  reference: z
    .string()
    .optional()
    .nullable(),

  notes: z
    .string()
    .optional()
    .nullable(),
});