import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export class ProductController {

  // 🚀 1. புதிய தயாரிப்பை உருவாக்குதல் (Create)
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, slug, description, categoryId, moq, status, variant, images, videos } = req.body;

      if (!name || !slug || !categoryId || !variant) {
        return res.status(400).json({ success: false, message: "Required fields are missing." });
      }

      const product = await prisma.$transaction(async (tx) => {
        const category = await tx.category.findUnique({ where: { id: categoryId } });
        if (!category) throw new Error("Category not found");

        const slugExists = await tx.product.findUnique({ where: { slug: slug.toLowerCase() } });
        if (slugExists) throw new Error("Product slug already exists.");

        const skuExists = await tx.productVariant.findUnique({ where: { sku: variant.sku } });
        if (skuExists) throw new Error("SKU already exists.");

        const createdProduct = await tx.product.create({
          data: {
            name,
            slug: slug.toLowerCase(),
            description,
            categoryId,
            moq: Number(moq),
            status: status || "DRAFT",
            publishedAt: status === "PUBLISHED" ? new Date() : null,
            variants: {
              create: {
                sku: variant.sku,
                weight: variant.weight,
                price: Number(variant.price),
                costPrice: Number(variant.costPrice),
                stock: Number(variant.stock),
              },
            },
            ...(images?.length && {
              images: {
                create: images.map((url: string, index: number) => ({
                  url,
                  isPrimary: index === 0,
                })),
              },
            }),
            ...(videos?.length && {
              videos: {
                create: videos.map((url: string) => ({ url })),
              },
            }),
          },
          include: { variants: true, images: true, videos: true },
        });

        await tx.auditLog.create({
          data: {
            userId: req.user?.id,
            userEmail: req.user?.email,
            action: "CREATE_PRODUCT",
            module: "PRODUCT",
            entityId: createdProduct.id,
            description: `Created Product ${createdProduct.name}`,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"] || "",
          },
        });

        return createdProduct;
      });

      return res.status(201).json({ success: true, message: "Product created successfully", data: product });
    } catch (error) {
      return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Product creation failed" });
    }
  }

  // 🔍 2. அனைத்து தயாரிப்புகளையும் பெறுதல் (Read All)
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const products = await prisma.product.findMany({
  include: {
    images: true,
    videos: true,
    category: true,
    variants: true,
  },
  orderBy: {
    createdAt: "desc",
  },
});
     const totalProducts = await prisma.product.count();
      return res.json({
        success: true,
        data: products,
        pagination: { total: totalProducts, page, limit, totalPages: Math.ceil(totalProducts / limit) }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // 📝 3. தயாரிப்பை திருத்துதல் (Update)
  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      
      if (data.status === "PUBLISHED") {
        data.publishedAt = new Date();
      }

      const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true }
      });

      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      const updated = await prisma.$transaction(async (tx) => {
        const { variant, ...productData } = data;
        
        await tx.product.update({
          where: { id },
          data: productData
        });

        if (variant && product.variants.length > 0) {
          await tx.productVariant.update({
            where: { id: product.variants[0].id },
            data: {
              sku: variant.sku,
              weight: variant.weight,
              price: Number(variant.price),
              costPrice: Number(variant.costPrice),
              stock: Number(variant.stock)
            }
          });
        }

        await tx.auditLog.create({
          data: {
            userId: req.user?.id,
            userEmail: req.user?.email,
            action: "UPDATE_PRODUCT",
            module: "PRODUCT",
            entityId: id,
            description: `Updated Product ${data.name || product.name}`,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"] || ""
          }
        });

        return await tx.product.findUnique({
          where: { id },
          include: { variants: true, images: true, videos: true, category: true }
        });
      });

      return res.json({ success: true, message: "Product updated successfully", data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: '❌ புதுப்பிக்க முடியவில்லை!', error: error.message });
    }
  }

  // 🗑️ 4. தயாரிப்பை நீக்குதல்
  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.product.update({ where: { id }, data: { isActive: false } });
      return res.json({ success: true, message: '✅ தயாரிப்பு வெற்றிகரமாக நீக்கப்பட்டது!' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // 🔍 5. Single Product
  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id },
        include: { images: true, videos: true, category: true, variants: true },
      });
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });
      return res.json({ success: true, data: product });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🔍 6. தேடல் மற்றும் வடிகட்டி (Search)
  static async search(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, categoryId } = req.query;
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          status: "PUBLISHED", // Update: Status Filter
          name: name ? { contains: name as string, mode: "insensitive" } : undefined,
          categoryId: categoryId ? (categoryId as string) : undefined,
        },
        include: { images: true, videos: true, category: true, variants: true },
      });
      return res.json({ success: true, data: products });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }


  static async bulkUpdateStatus(
  req: AuthenticatedRequest,
  res: Response
) {

  try {

    const {
      ids,
      status
    } = req.body;

    if (!ids?.length) {

      return res.status(400).json({

        success:false,

        message:"No products selected"

      });

    }

    await prisma.product.updateMany({

      where:{

        id:{
          in:ids
        }

      },

      data:{

        status,

        publishedAt:
        status==="PUBLISHED"
        ?new Date()
        :null

      }

    });

    return res.json({

      success:true,

      message:"Products updated successfully"

    });

  }

  catch(error:any){

    return res.status(500).json({

      success:false,

      message:error.message

    });

  }

}

static async restore(
  req: AuthenticatedRequest,
  res: Response
) {
  try {

    const { id } = req.params;

    await prisma.product.update({
      where: { id },
      data: {
        isActive: true
      }
    });

    return res.json({
      success: true,
      message: "Product restored successfully"
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
}
// 🌍 Public Products (Customer)
static async getPublic(req: AuthenticatedRequest, res: Response) {

  try {

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({

      where: {

        isActive: true,

        status: "PUBLISHED"

      },

      skip,

      take: limit,

      include: {

        images: true,

        videos: true,

        category: true,

        variants: true

      },

      orderBy: {

        createdAt: "desc"

      }

    });

    const totalProducts =
      await prisma.product.count({

        where: {

          isActive: true,

          status: "PUBLISHED"

        }

      });

    return res.json({

      success: true,

      data: products,

      pagination: {

        total: totalProducts,

        page,

        limit,

        totalPages:
          Math.ceil(totalProducts / limit)

      }

    });

  }

  catch (error: any) {

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

}

}