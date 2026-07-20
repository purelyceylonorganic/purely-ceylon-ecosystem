import cloudinary from "../../config/cloudinary";
import streamifier from "streamifier";

export function uploadToCloudinary(
  buffer: Buffer,
  folder = "products"
): Promise<string> {

  return new Promise((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {

        if (error) {
          reject(error);
          return;
        }

        resolve(result!.secure_url);

      }
    );

    streamifier.createReadStream(buffer).pipe(stream);

  });

}