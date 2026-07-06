import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSalesSummary = async (
  req: Request,
  res: Response
) => {

  try {

    const sales = await prisma.bulkOrder.aggregate({

      _sum:{
        totalAmount:true
      },

      _count:true

    });

    return res.json({

      success:true,

      data:{
        totalOrders:sales._count,
        totalRevenue:sales._sum.totalAmount ?? 0
      }

    });

  } catch(error:any){

    return res.status(500).json({
      success:false,
      message:error.message
    });

  }

};

export const getShipmentReport = async (
req:Request,
res:Response
)=>{
try{

const total=
await prisma.shipment.count();

const shipped=
await prisma.shipment.count({
where:{
status:"SHIPPED"
}
});

const delivered=
await prisma.shipment.count({
where:{
status:"DELIVERED"
}
});

res.json({
success:true,
data:{
total,
shipped,
delivered
}
});

}catch(error:any){

res.status(500).json({
success:false,
message:error.message
});

}
};

export const getBuyerReport = async (
req:Request,
res:Response
)=>{

const buyers=
await prisma.wholesaleBuyer.findMany({

include:{
bulkOrders:true
}

});

res.json({
success:true,
data:buyers
});

};
