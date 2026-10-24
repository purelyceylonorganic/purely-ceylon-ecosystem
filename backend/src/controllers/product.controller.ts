import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ROLES } from '../constants/roles';
import { PERMISSIONS } from '../constants/permissions';
import { hasPermission } from '../utils/permission.helper';
import {
  sanitizeProductDescription,
} from "../utils/sanitizeProductDescription";
const prisma = new PrismaClient();

// 🔐 Admin / Product நிர்வாகியா? (Draft, Deleted, costPrice பார்க்கலாம்)
function canManageProducts(req: AuthenticatedRequest): boolean {
  const role = req.user?.role;
  if (!role) return false;
  return role === ROLES.SUPER_ADMIN || hasPermission(role, PERMISSIONS.PRODUCT_UPDATE);
}

// 🙈 பொதுமக்களுக்கு costPrice (உங்கள் செலவு) ஒருபோதும் போகக்கூடாது
function hideCostPriceOne<T extends { variants?: any[] }>(product: T): T {
  if (!product.variants) return product;
  return {
    ...product,
    variants: product.variants.map(({ costPrice, ...rest }: any) => rest),
  };
}

function hideCostPrice<T extends { variants?: any[] }>(products: T[]): T[] {
  return products.map((product) => hideCostPriceOne(product));
}

const PRODUCT_STATUSES = ["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"];

export class ProductController {

static async create(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      name,
      slug,
      description,
      categoryId,
      moq,
      status,
      variant,
      variants,
      images,
      videos,
    } = req.body;

    const inputVariants = Array.isArray(variants)
      ? variants
      : variant
        ? [variant]
        : [];

    if (!name?.trim() || !slug?.trim() || !categoryId || inputVariants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product details and at least one variant are required.",
      });
    }

    const normalizedVariants = inputVariants.map((item: any) => ({
  sku: String(item.sku ?? "").trim(),
  weight: String(item.weight ?? "").trim(),
  price: Number(item.price),
  priceLKR: Number(item.priceLKR),
  costPrice: Number(item.costPrice ?? 0),
  stock: Number(item.stock ?? 0),
}));

    for (const item of normalizedVariants) {
      if (
        !item.sku ||
        !item.weight ||
        
!Number.isFinite(item.price) ||
!Number.isFinite(item.priceLKR) ||
!Number.isFinite(item.costPrice) ||
!Number.isInteger(item.stock) ||
item.price < 0 ||
item.priceLKR <= 0 ||
item.costPrice < 0 ||
item.stock < 0

      ) {
        return res.status(400).json({
          success: false,
          message: "Check every variant's SKU, weight, price, cost price and stock.",
        });
      }
    }

    const skus = normalizedVariants.map((item: any) => item.sku);

    if (new Set(skus).size !== skus.length) {
      return res.status(400).json({
        success: false,
        message: "Each variant must have a unique SKU.",
      });
    }

    const product = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      const slugExists = await tx.product.findUnique({
        where: { slug: slug.trim().toLowerCase() },
      });

      if (slugExists) {
        throw new Error("Product slug already exists.");
      }

      const existingSkus = await tx.productVariant.findMany({
        where: { sku: { in: skus } },
        select: { sku: true },
      });

      if (existingSkus.length > 0) {
        throw new Error(
          `SKU already exists: ${existingSkus.map((item) => item.sku).join(", ")}`
        );
      }

      const createdProduct = await tx.product.create({
        data: {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: sanitizeProductDescription(description),
          categoryId,
          moq: Number(moq ?? 1),
          status: status || "DRAFT",
          publishedAt: status === "PUBLISHED" ? new Date() : null,
          variants: {
            create: normalizedVariants,
          },
          ...(images?.length
            ? {
                images: {
                  create: images.map((url: string, index: number) => ({
                    url,
                    isPrimary: index === 0,
                  })),
                },
              }
            : {}),
          ...(videos?.length
            ? {
                videos: {
                  create: videos.map((url: string) => ({ url })),
                },
              }
            : {}),
        },
        include: {
          variants: true,
          images: true,
          videos: true,
        },
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

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(400).json({
      success: false,
      message: error instanceof Error
        ? error.message
        : "Product creation failed",
    });
  }
}

  // 🔍 2. அனைத்து தயாரிப்புகளையும் பெறுதல் (Read All)
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
      const skip = (page - 1) * limit;
      const staff = canManageProducts(req);

      const name = typeof req.query.name === "string" ? req.query.name.trim() : "";
      const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : "";
      const status = typeof req.query.status === "string" ? req.query.status : "";

      const where: any = {
        isActive: true,
        ...(name && { name: { contains: name, mode: "insensitive" } }),
        ...(categoryId && { categoryId }),
      };

      if (staff) {
        // Admin: எல்லாவற்றையும் பார்க்கலாம்; status வடிகட்டலாம்
        if (status === "DELETED") {
          where.deletedAt = { not: null };
        } else if (PRODUCT_STATUSES.includes(status)) {
          where.status = status;
        }
      } else {
        // பொதுமக்கள்: Published மற்றும் நீக்காதவை மட்டும்
        where.status = "PUBLISHED";
        where.deletedAt = null;
      }

      const [products, totalProducts] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          include: {
            images: true,
            videos: true,
            category: true,
            variants: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
      ]);

      return res.json({
        success: true,
        data: staff ? products : hideCostPrice(products),
        pagination: {
          total: totalProducts,
          page,
          limit,
          totalPages: Math.ceil(totalProducts / limit),
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }


  
static async getById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const staff = canManageProducts(req);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        videos: true,
        category: true,
        variants: true,
      },
    });

    // பொதுமக்களுக்கு: Draft / நீக்கிய / செயலற்ற product-ஐக் காட்டக்கூடாது
    const hiddenFromPublic =
      !product ||
      !product.isActive ||
      product.deletedAt !== null ||
      product.status === "DRAFT" ||
      product.status === "ARCHIVED";

    if (!product || (!staff && hiddenFromPublic)) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      data: staff ? product : hideCostPriceOne(product),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
}

  // 📝 3. தயாரிப்பை திருத்துதல் (Update)
 
  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      delete data.deletedAt; // delete / restore மூலம் மட்டுமே மாறும்

      if (data.status === "PUBLISHED") {
        data.publishedAt = new Date();
        data.deletedAt = null; // Publish செய்தால் "Deleted" குறி நீங்கும்
      }

      const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const { variant, variants, ...productData } = data;

        // Variant fields must not be passed to Product.update()
        await tx.product.update({
          where: { id },
          data: productData,
        });

        // Support both the new array and the legacy single object
        let variantsToProcess: any[] | undefined;

        if (Array.isArray(variants)) {
          if (variants.length === 0) {
            throw new Error("At least one product variant is required.");
          }
          variantsToProcess = variants;
        } else if (variant) {
          // Backward compatibility with the existing frontend
          variantsToProcess = [
            {
              ...variant,
              id: product.variants[0]?.id,
            },
          ];
        }

        if (variantsToProcess) {
          const normalizedVariants = variantsToProcess.map((item) => {
            const sku = String(item.sku ?? "").trim();
            const weight = String(item.weight ?? "").trim();
            const price = Number(item.price);
            const priceLKR = Number(item.priceLKR);
            const costPrice = Number(item.costPrice ?? 0);
            const stock = Number(item.stock ?? 0);

            if (
              !sku ||
              !weight ||
              !Number.isFinite(price) ||
              !Number.isFinite(priceLKR) ||
              priceLKR <= 0 ||
              !Number.isFinite(costPrice) ||
              !Number.isInteger(stock) ||
              price < 0 ||
              costPrice < 0 ||
              stock < 0
            ) {
              throw new Error(
                "Invalid SKU, weight, price, cost price, or stock."
              );
            }

            
return {
  id: item.id ? String(item.id) : undefined,
  sku,
  weight,
  price,
  priceLKR,
  costPrice,
  stock,
};

          });

          // Prevent duplicate SKUs within this request
          const skus = normalizedVariants.map((item) => item.sku);

          if (new Set(skus).size !== skus.length) {
            throw new Error("Duplicate SKUs found in the variants.");
          }

          for (const item of normalizedVariants) {
            if (item.id) {
              const existingVariant = product.variants.find(
                (current) => current.id === item.id
              );

              if (!existingVariant) {
                throw new Error(
                  "Variant does not belong to this product."
                );
              }
            }

            const existingSku = await tx.productVariant.findUnique({
              where: { sku: item.sku },
            });

            if (
              existingSku &&
              existingSku.id !== item.id
            ) {
              throw new Error(
                `SKU "${item.sku}" already exists.`
              );
            }

            const variantData = {
              sku: item.sku,
              weight: item.weight,
              price: item.price,
              priceLKR: item.priceLKR,
              costPrice: item.costPrice,
              stock: item.stock,
            };

            if (item.id) {
              await tx.productVariant.update({
                where: { id: item.id },
                data: variantData,
              });
            } else {
              await tx.productVariant.create({
                data: {
                  productId: id,
                  ...variantData,
                },
              });
            }
          }
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
            userAgent: req.headers["user-agent"] || "",
          },
        });

        return await tx.product.findUnique({
          where: { id },
          include: {
            variants: true,
            images: true,
            videos: true,
            category: true,
          },
        });
      });

      return res.json({
        success: true,
        message: "Product updated successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: "❌ புதுப்பிக்க முடியவில்லை!",
        error: error.message,
      });
    }
  }


  // 🗑️ 4. தயாரிப்பை நீக்குதல்

  // 🔍 5. Single Product
static async delete(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product || !product.isActive || product.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Product not found or already deleted",
      });
    }

    // 🗑️ உண்மையில் அழிக்காமல் Draft-க்கு நகர்த்துகிறோம் (restore செய்யலாம்)
    await prisma.product.update({
      where: { id },
      data: {
        status: "DRAFT",
        publishedAt: null,
        featured: false,
        deletedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "Product moved to Draft. You can restore it any time.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

  // 🔍 6. தேடல் மற்றும் வடிகட்டி (Search)
  static async search(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, categoryId } = req.query;
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          status: "PUBLISHED", // Update: Status Filter
          name: name ? { contains: name as string, mode: "insensitive" } : undefined,
          categoryId: categoryId ? (categoryId as string) : undefined,
        },
        include: { images: true, videos: true, category: true, variants: true },
      });
      return res.json({ success: true, data: hideCostPrice(products) });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }


  static async bulkUpdateStatus(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products selected",
      });
    }

    if (!PRODUCT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status",
      });
    }

    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        ...(status === "PUBLISHED" && { deletedAt: null }),
      },
    });

    return res.json({
      success: true,
      message: "Products updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

static async restore(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Draft-ஆகவே மீட்கப்படும்; தயாரானதும் Publish செய்யலாம்
    await prisma.product.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
        status: "DRAFT",
      },
    });

    return res.json({
      success: true,
      message: "Product restored to Draft. Publish it when you are ready.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// 🌍 Public Products (Customer)
static async getPublic(req: AuthenticatedRequest, res: Response) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      status: "PUBLISHED" as const,
      deletedAt: null,
    };

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: true,
          videos: true,
          category: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      success: true,
      data: hideCostPrice(products),
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


static async toggleFeatured(
  req: AuthenticatedRequest,
  res: Response
) {
  try {

    const { id } = req.params;

    const product =
      await prisma.product.findUnique({
        where: { id },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updatedProduct =
      await prisma.product.update({
        where: { id },
        data: {
          featured: !product.featured,
        },
      });

    return res.json({
      success: true,
      message: updatedProduct.featured
        ? "Product marked as featured"
        : "Product removed from featured",
      data: updatedProduct,
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}

}