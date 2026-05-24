import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export class ProductController {
  // 🚀 1. புதிய தயாரிப்பை உருவாக்குதல் (Create)
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, slug, description, basePrice, sku, stock, weight, categoryId, images, videos } = req.body;

      const product = await prisma.product.create({
        // Cast to any to avoid strict type mismatches between runtime request body
        // and Prisma's generated CreateInput types.
        data: {
          name,
          slug: slug.toLowerCase(),
          description,
          basePrice: parseFloat(basePrice),
          sku,
          stock: parseInt(stock),
          weight,
          categoryId,
          productImages: {
            create: images?.map((url: string, index: number) => ({ url, isPrimary: index === 0 }))
          },
          productVideos: {
            create: videos?.map((url: string) => ({ url }))
          }
        } as any
      });

      // 🛡️ எண்டர்பிரைஸ் தணிக்கை பதிவு (Audit Log Execution)
      await (prisma as any).auditLog.create({
        data: {
          userId: req.user?.userId,
          action: 'CREATE_PRODUCT',
          details: `தயாரிப்பு சேர்க்கப்பட்டது: ${name} (SKU: ${sku})`
        }
      });

      return res.status(201).json({ success: true, message: '✅ தயாரிப்பு வெற்றிகரமாக களஞ்சியத்தில் சேர்க்கப்பட்டது!', data: product });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: '❌ தயாரிப்பை சேர்க்க முடியவில்லை!', error: error.message });
    }
  }

  // 🔍 2. அனைத்து தயாரிப்புகளையும் பெறுதல் (Read All)
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const products = await prisma.product.findMany({
  include: {
    images: true,
    videos: true,
    category: true,
  }
})
      return res.json({ success: true, data: products });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // 📝 3. தயாரிப்பை திருத்துதல் (Update)
static async update(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data
    });

    // 🛡️ Audit Log: புதுப்பித்தல் பதிவு
    await (prisma as any).auditLog.create({
      data: {
        userId: req.user?.userId,
        action: 'UPDATE_PRODUCT',
        details: `தயாரிப்பு ID ${id} புதுப்பிக்கப்பட்டது.`
      }
    });

    return res.json({ success: true, message: '✅ விபரங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!', data: updatedProduct });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: '❌ புதுப்பிக்க முடியவில்லை!', error: error.message });
  }
}

// 🗑️ 4. தயாரிப்பை தற்காலிகமாக நீக்குதல் (Soft Delete)
static async delete(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    await prisma.product.update({
      where: { id },
      data: { isActive: false } as any
    });

    // 🛡️ Audit Log: நீக்கல் பதிவு
    await (prisma as any).auditLog.create({
      data: {
        userId: req.user?.userId,
        action: 'DELETE_PRODUCT',
        details: `தயாரிப்பு ID ${id} செயலிழக்கப்பட்டது (Soft Delete).`
      }
    });

    return res.json({ success: true, message: '✅ தயாரிப்பு வெற்றிகரமாக நீக்கப்பட்டது!' });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

// 🔍 5. தேடல் மற்றும் வடிகட்டி (Search & Filter)
static async search(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, categoryId, minPrice } = req.query;
    
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: name as string, mode: 'insensitive' },
        categoryId: categoryId ? (categoryId as string) : undefined,
        basePrice: { gte: minPrice ? parseFloat(minPrice as string) : 0 }
      }
    });
    
    return res.json({ success: true, data: products });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
}