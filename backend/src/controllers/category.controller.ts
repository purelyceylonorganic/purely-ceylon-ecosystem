import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryController {
  // ➕ புதிய கேட்டகிரி உருவாக்குதல்
  static async create(req: Request, res: Response) {
    try {
      const { name, slug } = req.body;
      const category = await (prisma as any).category.create({
        data: { name, slug: slug.toLowerCase() }
      });
      return res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: '❌ கேட்டகிரி உருவாக்க முடியவில்லை!', error: error.message });
    }
  }

  // 📋 அனைத்து கேட்டகிரிகளையும் பெறுதல்
  static async getAll(req: Request, res: Response) {
    try {
      const categories = await (prisma as any).category.findMany({
        include: { _count: { select: { products: true } } }
      });
      return res.json({ success: true, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}