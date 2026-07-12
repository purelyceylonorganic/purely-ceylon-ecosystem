import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export class AddressController {
  
  // ==========================================
  // ➕ 1. புதிய டெலிவரி முகவரியைச் சேர்த்தல்
  // ==========================================
  static async addAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const { fullName, phone, street, city, province, postalCode, country, isDefault } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'அணுகல் மறுக்கப்பட்டது!' });
      }

      // பயனர் இதனை default முகவரியாக மாற்றக் கோரினால், பழைய default முகவரிகளை false ஆக்க வேண்டும்
      if (isDefault) {
        await (prisma as any).address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      const newAddress = await (prisma as any).address.create({
        data: { 
          userId, 
          fullName, 
          phone, 
          street, 
          city, 
          province, 
          postalCode, 
          country: country || 'Sri Lanka', 
          isDefault: isDefault || false 
        }
      });

      return res.status(201).json({ 
        success: true, 
        message: '✅ முகவரி வெற்றிகரமாகச் சேர்க்கப்பட்டது!', 
        data: newAddress 
      });
    } catch (error: any) {
      console.error("❌ PRISMA CREATE ADDRESS ERROR:", error); 
      return res.status(400).json({ 
        success: false, 
        message: 'முகவரியைச் சேமிக்க முடியவில்லை!',
        error: error.message,
        details: error 
      });
    }
  }

  // ==========================================
  // 📋 2. பயனரின் அனைத்து முகவரிகளையும் பெறுதல்
  // ==========================================
  static async getMyAddresses(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      console.log("========== ADDRESS ==========");
      console.log("USER =", req.user);

      const addresses = await (prisma as any).address.findMany({
        where: { userId }
      });

      console.log("ADDRESSES =", addresses);

      return res.json({
        success: true,
        data: addresses
      });
    } catch (error: any) {
      console.error("ADDRESS ERROR =", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // ==========================================
  // ✏️ 3. முகவரியைப் புதுப்பித்தல் (Update & Secure)
  // ==========================================
  static async updateAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { fullName, phone, street, city, province, postalCode, country, isDefault } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // முகவரி இருக்கிறதா மற்றும் அது இந்த பயனருடையதுதானா என்று சரிபார்த்தல் (Security Check)
      const existingAddress = await (prisma as any).address.findUnique({
        where: { id }
      });

      if (!existingAddress || existingAddress.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "உங்களுக்கு இந்த முகவரியை மாற்ற அனுமதி இல்லை"
        });
      }

      // தற்போதைய புதுப்பிப்பில் isDefault true ஆக இருந்தால், பிற முகவரிகளை false ஆக்க வேண்டும்
      if (isDefault) {
        await (prisma as any).address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      const updated = await (prisma as any).address.update({
        where: { id },
        data: { fullName, phone, street, city, province, postalCode, country, isDefault }
      });

      return res.json({
        success: true,
        data: updated
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==========================================
  // ❌ 4. முகவரியை நீக்குதல் (Delete & Secure)
  // ==========================================
  static async deleteAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const existingAddress = await (prisma as any).address.findUnique({
        where: { id }
      });

      if (!existingAddress || existingAddress.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "உங்களுக்கு இந்த முகவரியை நீக்க அனுமதி இல்லை"
        });
      }

      await (prisma as any).address.delete({
        where: { id }
      });

      return res.json({
        success: true,
        message: "Address deleted successfully"
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==========================================
  // 📍 5. முதன்மை (Default) முகவரியை மாற்றுதல்
  // ==========================================
  static async setDefaultAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // முகவரியைக் கண்டறிந்து பாதுகாப்பு சரிபார்ப்பு செய்தல்
      const address = await (prisma as any).address.findUnique({
        where: { id }
      });

      if (!address || address.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: "முகவரி கண்டறியப்படவில்லை அல்லது அனுமதி இல்லை"
        });
      }

      // Prisma Transaction மூலம் ஒரே நேரத்தில் பழைய அட்ரஸ்களை false ஆக்கிவிட்டு புதியதை true ஆக்குதல்
      await (prisma as any).$transaction([
        (prisma as any).address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        }),
        (prisma as any).address.update({
          where: { id },
          data: { isDefault: true }
        })
      ]);

      // புதுப்பிக்கப்பட்ட தரவை மீண்டும் எடுத்தல்
      const updatedAddress = await (prisma as any).address.findUnique({
        where: { id }
      });

      return res.json({
        success: true,
        data: updatedAddress
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}