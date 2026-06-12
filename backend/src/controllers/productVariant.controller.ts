import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//
// ============================
// ➕ CREATE PRODUCT VARIANT
// ============================
//
export const createProductVariant = async (req: Request, res: Response) => {
  try {
    const { productId, sku, weight, price, costPrice, stock } = req.body;

    if (!productId || !sku || !weight || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        sku,
        weight,
        price: Number(price),
        costPrice: Number(costPrice || 0),
        stock: Number(stock || 0),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product variant created successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Create Variant Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating product variant",
    });
  }
};

//
// ============================
// 📦 GET ALL VARIANTS
// ============================
//
export const getAllVariants = async (req: Request, res: Response) => {
  try {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: variants,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching variants",
    });
  }
};

//
// ============================
// 🔍 GET VARIANT BY ID
// ============================
//
export const getVariantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    return res.json({
      success: true,
      data: variant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching variant",
    });
  }
};

//
// ============================
// ✏️ UPDATE VARIANT
// ============================
//
export const updateVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sku, weight, price, costPrice, stock } = req.body;

    const updated = await prisma.productVariant.update({
      where: { id },
      data: {
        sku,
        weight,
        price: price ? Number(price) : undefined,
        costPrice: costPrice ? Number(costPrice) : undefined,
        stock: stock ? Number(stock) : undefined,
      },
    });

    return res.json({
      success: true,
      message: "Variant updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating variant",
    });
  }
};

//
// ============================
// 🗑️ DELETE VARIANT
// ============================
//
export const deleteVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.productVariant.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting variant",
    });
  }
};