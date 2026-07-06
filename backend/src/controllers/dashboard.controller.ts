import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAdminDashboard = async (
  req: Request,
  res: Response
) => {

  try {

    const totalBuyers =
      await prisma.wholesaleBuyer.count();

    const totalRFQs =
      await prisma.rFQ.count();

    const totalOrders =
      await prisma.bulkOrder.count();

    const totalInvoices =
      await prisma.exportInvoice.count();

    const totalShipments =
      await prisma.shipment.count();

    return res.status(200).json({

      success:true,

      data:{
        totalBuyers,
        totalRFQs,
        totalOrders,
        totalInvoices,
        totalShipments
      }

    });

  } catch(error:any){

    return res.status(500).json({

      success:false,

      message:error.message

    });

  }

};

export const getBuyerDashboard = async (
  req: Request,
  res: Response
) => {

  try{

    const { buyerId } = req.params;

    const rfqs =
      await prisma.rFQ.count({
        where:{
          buyerId
        }
      });

    const orders =
      await prisma.bulkOrder.count({
        where:{
          buyerId
        }
      });

    const invoices =
      await prisma.exportInvoice.count({
        where:{
          bulkOrder:{
            buyerId
          }
        }
      });

    return res.status(200).json({

      success:true,

      data:{
        rfqs,
        orders,
        invoices
      }

    });

  }catch(error:any){

    return res.status(500).json({

      success:false,

      message:error.message

    });

  }

};

