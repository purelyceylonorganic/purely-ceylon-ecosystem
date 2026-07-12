import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCustomerDashboard =
async (
  req: any,
  res: Response
) => {

  try {

    const userId = req.user.id;

    const orders =
      await prisma.order.count({
        where:{
          userId
        }
      });

    const activeOrders =
      await prisma.order.count({
        where:{
          userId,
          status:{
            not:"DELIVERED"
          }
        }
      });

    const spent =
      await prisma.order.aggregate({
        where:{
          userId
        },
        _sum:{
          totalFinal:true
        }
      });

    return res.json({
      success:true,
      data:{
        orders,
        activeOrders,
        wishlist:0,
        spent:
          spent._sum.totalFinal || 0
      }
    });

  } catch(error:any){

    return res.status(500).json({
      success:false,
      message:error.message
    });

  }

};