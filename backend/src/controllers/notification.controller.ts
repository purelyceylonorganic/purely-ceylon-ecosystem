import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getNotifications = async (
  req: Request,
  res: Response
) => {
  try {

    const notifications =
      await prisma.notification.findMany({
        orderBy: {
          createdAt: "desc"
        },
        take: 20
      });

    return res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Notification Error"
    });
  }
};