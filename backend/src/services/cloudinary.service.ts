import cloudinary from "../config/cloudinary";

export const uploadImageToCloudinary = async (
  filePath: string
) => {

  const result = await cloudinary.uploader.upload(
    filePath,
    {
      folder: "purely-ceylon/products",
      resource_type: "image",
    }
  );


  return {
    url: result.secure_url,
    publicId: result.public_id,
  };

};