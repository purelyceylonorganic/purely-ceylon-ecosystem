import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const getAllRFQsAdmin = async (
req: Request,
res: Response
) => {

try {

const rfqs = await prisma.rFQ.findMany({

include:{
  buyer:true,
  items:true
},

orderBy:{
  createdAt:"desc"
}

});


return res.status(200).json({

success:true,
data:rfqs

});


}catch(error:any){

return res.status(500).json({

success:false,
message:error.message

});

}

};