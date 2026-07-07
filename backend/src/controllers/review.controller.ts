import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// =====================================
// ⭐ ADD REVIEW
// =====================================
export const addReview = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const { productId } = req.params;

    const {
      rating,
      comment,
    } = req.body;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const exists = await prisma.review.findFirst({
      where: {
        productId,
        userId: user.id,
      },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product.",
      });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating,
        comment,
      },
    });

    return res.json({
      success: true,
      message: "Review Added Successfully",
      review,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================
// ⭐ GET PRODUCT REVIEWS
// =====================================
export const getProductReviews = async (
  req: Request,
  res: Response
) => {
  try {

    const { productId } = req.params;

    const reviews =
      await prisma.review.findMany({

        where: {
          productId,
        },

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const average =
      reviews.length > 0
        ? reviews.reduce(
            (sum: any, item: any) => sum + item.rating,
            0
          ) / reviews.length
        : 0;

    return res.json({
      success: true,

      averageRating: Number(
        average.toFixed(1)
      ),

      totalReviews: reviews.length,

      reviews,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// ⭐ UPDATE REVIEW
// =====================================
export const updateReview = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const { id } = req.params;

    const { rating, comment } = req.body;

    const review =
      await prisma.review.findUnique({
        where: {
          id,
        },
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    const updated =
      await prisma.review.update({
        where: {
          id,
        },
        data: {
          rating,
          comment,
        },
      });

    return res.json({
      success: true,
      message: "Review Updated Successfully",
      review: updated,
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// =====================================
// ⭐ DELETE REVIEW
// =====================================
export const deleteReview = async (
  req: Request,
  res: Response
) => {

  try {

    const user = (req as any).user;

    const { id } = req.params;

    const review =
      await prisma.review.findUnique({
        where: {
          id,
        },
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    await prisma.review.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Review Deleted Successfully",
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};