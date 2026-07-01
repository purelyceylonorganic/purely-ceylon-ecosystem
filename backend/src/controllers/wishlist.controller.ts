import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ===============================
// ❤️ ADD TO WISHLIST
// ===============================
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { productVariantId } = req.body;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId: user.id,
        },
      });
    }

    const exists = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productVariantId,
      },
    });

    if (exists) {
      return res.json({
        success: true,
        message: "Already in Wishlist",
      });
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productVariantId,
      },
    });

    return res.json({
      success: true,
      message: "Added to Wishlist",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// ❤️ GET MY WISHLIST
// ===============================
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      wishlist,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// ❤️ REMOVE WISHLIST ITEM
// ===============================
export const removeWishlistItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.wishlistItem.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Removed Successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};