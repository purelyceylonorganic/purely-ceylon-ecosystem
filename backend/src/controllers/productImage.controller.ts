import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

const prisma = new PrismaClient();

function uploadToCloudinary(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "products",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export class ProductImageController {

    static async addImage(req: AuthenticatedRequest, res: Response) {
        try {
            const { productId, url, isPrimary } = req.body;

            if (!productId || !url) {
                return res.status(400).json({ success: false, message: "Product ID and Image URL required" });
            }

            const product = await prisma.product.findUnique({ where: { id: productId } });
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            const image = await prisma.productImage.create({
                data: { productId, url, isPrimary: isPrimary || false }
            });

            // Add Audit Log
            await prisma.auditLog.create({
                data: {
                    userId: req.user?.id,
                    userEmail: req.user?.email,
                    action: "CREATE_PRODUCT_IMAGE",
                    module: "PRODUCT_IMAGE",
                    entityId: image.id,
                    description: `Added image for product ${productId}`,
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"] || ""
                }
            });

            return res.status(201).json({ success: true, message: "Image added successfully", data: image });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // Step 7.1.3 to 7.1.8: Multiple images upload செய்யும் வகையில் மாற்றப்பட்டுள்ளது
    static async uploadImage(req: AuthenticatedRequest, res: Response) {
      try {
        const { productId } = req.body;

        if (!productId) {
          return res.status(400).json({
            success: false,
            message: "Product ID is required",
          });
        }

        // req.file-க்கு பதிலாக req.files என Express.Multer.File[] ஆக மாற்றப்பட்டுள்ளது
        const files = req.files as Express.Multer.File[];

        // Validation checking
        if (!files || files.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Image files are required",
          });
        }

        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Loop through all uploaded files
        for (const file of files) {
            // Cloudinary upload
            const uploaded = await uploadToCloudinary(file.buffer);

            // Save details in Database
            const image = await prisma.productImage.create({
                data: {
                    productId,
                    url: uploaded.secure_url,
                    publicId: uploaded.public_id,
                    isPrimary: false // Multiple uploads-ல் எல்லாமே default ஆக false-ஆக இருக்கும்
                }
            });

            // Add Audit Log for each image
            await prisma.auditLog.create({
                data: {
                    userId: req.user?.id,
                    userEmail: req.user?.email,
                    action: "CREATE_PRODUCT_IMAGE",
                    module: "PRODUCT_IMAGE",
                    entityId: image.id,
                    description: `Uploaded image via multi-upload for product ${productId}`,
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"] || ""
                }
            });
        }

        // Loop முடிந்த பிறகு ரிட்டன் செய்கிறது
        return res.json({
          success: true,
          message: "Images uploaded successfully",
        });

      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }

    static async setPrimaryImage(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            const image = await prisma.productImage.findUnique({ where: { id } });
            if (!image) {
                return res.status(404).json({ success: false, message: "Image not found" });
            }

            await prisma.$transaction(async (tx) => {
                await tx.productImage.updateMany({
                    where: { productId: image.productId },
                    data: { isPrimary: false }
                });

                await tx.productImage.update({
                    where: { id },
                    data: { isPrimary: true }
                });
            });

            await prisma.auditLog.create({
                data: {
                    userId: req.user?.id,
                    userEmail: req.user?.email,
                    action: "SET_PRIMARY_IMAGE",
                    module: "PRODUCT_IMAGE",
                    entityId: id,
                    description: "Changed primary product image",
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"] || ""
                }
            });

            return res.json({ success: true, message: "Primary image updated successfully" });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async deleteImage(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            const image = await prisma.productImage.findUnique({ where: { id } });
            if (!image) {
                return res.status(404).json({ success: false, message: "Image not found" });
            }

            if (image.publicId) {
                await cloudinary.uploader.destroy(image.publicId);
            }

            await prisma.productImage.delete({ where: { id } });

            await prisma.auditLog.create({
                data: {
                    userId: req.user?.id,
                    userEmail: req.user?.email,
                    action: "DELETE_PRODUCT_IMAGE",
                    module: "PRODUCT_IMAGE",
                    entityId: id,
                    description: `Deleted product image`,
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"] || ""
                }
            });

            return res.json({ success: true, message: "Image deleted" });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async setPrimary(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            const image = await prisma.productImage.findUnique({
                where: { id },
            });

            if (!image) {
                return res.status(404).json({
                    success: false,
                    message: "Image not found",
                });
            }

            const updatedImage = await prisma.$transaction(async (tx) => {
                await tx.productImage.updateMany({
                    where: { productId: image.productId },
                    data: { isPrimary: false },
                });

                return await tx.productImage.update({
                    where: { id },
                    data: { isPrimary: true },
                });
            });

            await prisma.auditLog.create({
                data: {
                    userId: req.user?.id,
                    userEmail: req.user?.email,
                    action: "SET_PRIMARY_IMAGE",
                    module: "PRODUCT_IMAGE",
                    entityId: id,
                    description: `Set image ${id} as primary for product ${image.productId}`,
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"] || ""
                }
            });

            return res.json({
                success: true,
                message: "Primary image updated",
                data: updatedImage,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    static async getImages(req: AuthenticatedRequest, res: Response) {
        try {
            const { productId } = req.params;
            const images = await prisma.productImage.findMany({ where: { productId } });
            return res.json({ success: true, data: images });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}