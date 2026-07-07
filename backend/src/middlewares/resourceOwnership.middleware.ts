import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyBulkOrderOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const user = (req as any).user;

    const { id } = req.params;

    const order = await prisma.bulkOrder.findUnique({
      where: {
        id
      }
    });

    if (!order) {
      return res.status(404).json({
        success:false,
        message:"Bulk Order not found"
      });
    }

    if (
      user.role !== "SUPER_ADMIN" &&
      user.role !== "ADMIN" &&
      order.buyerId !== user.id
    ) {
      return res.status(403).json({
        success:false,
        message:"Access denied"
      });
    }

    next();

  } catch(error){

    return res.status(500).json({
      success:false,
      message:"Authorization failed"
    });

  }

};