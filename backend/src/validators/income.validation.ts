import { z } from "zod";
import { IncomeSource } from "@prisma/client";

export const createIncomeSchema = z.object({
  source: z.nativeEnum(IncomeSource).optional(),

  description: z.string().min(2, "Income description is required"),

  amount: z.number().positive("Amount must be greater than 0"),

  currency: z.enum(["LKR", "USD"]).optional(),

  incomeDate: z.string().optional(),

  reference: z.string().optional().nullable(),

  notes: z.string().optional().nullable(),
});

export const updateIncomeSchema = createIncomeSchema.partial();