import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const verifyRFQOwnership = async (
req: Request,
res: Response,
next: NextFunction
) => {

try {

const user = (req as any).user;
const { id } = req.params;


const rfq = await prisma.rFQ.findUnique({
 where:{
   id
 }
});


if(!rfq){

return res.status(404).json({
 success:false,
 message:"RFQ not found"
});

}


// ADMIN access
if(
 user.role === "ADMIN" ||
 user.role === "SUPER_ADMIN" ||
 user.role === "EXPORT_MANAGER"
){

return next();

}


// BUYER ownership check

const buyer =
await prisma.wholesaleBuyer.findUnique({

where:{
 email:user.email
}

});


if(!buyer){

return res.status(403).json({
success:false,
message:"Buyer account not found"
});

}


if(rfq.buyerId !== buyer.id){

return res.status(403).json({
success:false,
message:"Access denied"
});

}


next();


}
catch(error:any){

return res.status(500).json({
success:false,
message:error.message
});

}

};