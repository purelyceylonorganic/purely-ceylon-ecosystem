import { Request, Response } from "express";
import { prisma } from "../config/prisma"; // உங்கள் shared prisma path

const parseBody = (body: any) => {
  const country = String(body.country ?? "").trim();
  const taxName = String(body.taxName ?? "").trim();
  const rate = Number(body.rate);

  if (!country || !taxName || !Number.isFinite(rate) || rate < 0 || rate > 100) {
    return null;
  }
  return { country, taxName, rate };
};

export const createTaxRate = async (req: Request, res: Response) => {
  const data = parseBody(req.body);
  if (!data) {
    return res.status(400).json({ success: false, message: "Invalid tax data (rate 0-100)" });
  }
  try {
    const tax = await prisma.taxRate.create({
      data: { ...data, isActive: req.body.isActive !== false },
    });
    res.status(201).json({ success: true, tax });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to create tax rate" });
  }
};

export const getTaxRates = async (_req: Request, res: Response) => {
  try {
    const taxes = await prisma.taxRate.findMany({ orderBy: { updatedAt: "desc" } });
    res.json({ success: true, taxes });
  } catch {
    res.status(500).json({ success: false, message: "Failed to load tax rates" });
  }
};

export const updateTaxRate = async (req: Request, res: Response) => {
  const data = parseBody(req.body);
  if (!data) {
    return res.status(400).json({ success: false, message: "Invalid tax data (rate 0-100)" });
  }
  try {
    const tax = await prisma.taxRate.update({
      where: { id: req.params.id },
      data: { ...data, isActive: req.body.isActive !== false },
    });
    res.json({ success: true, tax });
  } catch {
    res.status(404).json({ success: false, message: "Tax rate not found" });
  }
};

export const toggleTaxRate = async (req: Request, res: Response) => {
  try {
    const current = await prisma.taxRate.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ success: false, message: "Not found" });
    const tax = await prisma.taxRate.update({
      where: { id: current.id },
      data: { isActive: !current.isActive },
    });
    res.json({ success: true, tax });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

export const deleteTaxRate = async (req: Request, res: Response) => {
  try {
    await prisma.taxRate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(404).json({ success: false, message: "Tax rate not found" });
  }
};

// பொது endpoints (மாற்றம் இல்லை)
export const getCountryTax = async (req: Request, res: Response) => {
  try {
    const tax = await prisma.taxRate.findFirst({
      where: { country: { equals: req.params.country, mode: "insensitive" }, isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ success: true, tax });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const calculateTax = async (req: Request, res: Response) => {
  try {
    const { country, amount } = req.body;
    const tax = await prisma.taxRate.findFirst({
      where: { country: { equals: String(country ?? ""), mode: "insensitive" }, isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    if (!tax) return res.status(404).json({ success: false, message: "Tax Rate Not Found" });

    const taxAmount = (amount * tax.rate) / 100;
    res.json({ success: true, subtotal: amount, taxRate: tax.rate, taxAmount, total: amount + taxAmount });
  } catch {
    res.status(500).json({ success: false });
  }
};