import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { uploadImageToCloudinary } from "../services/cloudinary.service";
import fs from "fs";


export class UploadController {


static async uploadProductImage(
req: AuthenticatedRequest,
res: Response
){

try{


if(!req.file){

return res.status(400).json({

success:false,
message:"Image file required"

});

}



const uploaded =
await uploadImageToCloudinary(
req.file.path
);



/*
Delete local file after upload
*/

fs.unlinkSync(
req.file.path
);



return res.json({

success:true,

message:"Image uploaded successfully",

data:uploaded

});


}
catch(error:any){

return res.status(500).json({

success:false,

message:error.message

});

}


}


}