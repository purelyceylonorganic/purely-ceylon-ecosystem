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
              productVariant: true
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

export const calculateShipping = async (
 req: Request,
 res: Response
) => {

 const { country } = req.body;

 let shippingCost = 20;
 let estimatedDays = 7;

 switch(country){

   case "Sri Lanka":
     shippingCost = 15;
     estimatedDays = 3;
     break;

   case "India":
     shippingCost = 25;
     estimatedDays = 5;
     break;

   case "UAE":
     shippingCost = 35;
     estimatedDays = 6;
     break;

   case "UK":
     shippingCost = 50;
     estimatedDays = 10;
     break;

   case "USA":
     shippingCost = 60;
     estimatedDays = 12;
     break;
 }

 return res.json({
   success:true,
   shippingCost,
   estimatedDays
 });
};
