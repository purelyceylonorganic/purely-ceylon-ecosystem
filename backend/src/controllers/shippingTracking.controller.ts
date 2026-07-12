import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getShipmentTracking = async (
  req: Request,
  res: Response
) => {
  try {

    const { trackingId } = req.params;

    const order =
      await prisma.order.findFirst({
        where: {
          trackingId
        }
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found"
      });
    }

    return res.json({
      success: true,
      data: {
        trackingId: order.trackingId,
        status: order.shippingStatus,
        updatedAt: order.updatedAt
      }
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
export const updateShipmentStatus = async (
  req: Request,
  res: Response
) => {

  try {

    const { orderId } = req.params;

    const { shippingStatus } = req.body;

    const order =
      await prisma.order.update({
        where: {
          id: orderId
        },
        data: {
          shippingStatus
        }
      });

    return res.json({
      success: true,
      data: order
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
