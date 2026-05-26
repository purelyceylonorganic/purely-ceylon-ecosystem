import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// 🚚 UPDATE SHIPPING STATUS
export const updateShippingStatus = async (
  req: Request,
  res: Response
) => {
  try {

    const { id } = req.params;

    const {
      shippingStatus
    } = req.body;

    const trackingId =
      'TRK-' + Date.now();

    const order =
      await prisma.order.update({
        where: {
          id
        },
        data: {
          shippingStatus,
          trackingId
        }
      });

    return res.status(200).json({
      success: true,
      message:
        '📦 Shipping updated successfully',
      order
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        '❌ Shipping update failed'
    });

  }
};


// 🔎 TRACK ORDER
export const trackOrder = async (
  req: Request,
  res: Response
) => {
  try {

    const { trackingId } = req.params;

    const order =
      await prisma.order.findFirst({
        where: {
          trackingId
        },
        include: {
          user: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          '❌ Tracking ID not found'
      });
    }

    return res.status(200).json({
      success: true,
      tracking: {
        trackingId:
          order.trackingId,

        shippingStatus:
          order.shippingStatus,

        orderDate:
          order.createdAt,

        customer:
          order.user.fullName,

        items:
          order.items
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        '❌ Tracking failed'
    });

  }
};