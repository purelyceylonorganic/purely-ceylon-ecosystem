import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export class AddressController {
  // ➕ புதிய டெலிவரி முகவரியைச் சேர்த்தல்
  static async addAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const { street, city, province, postalCode, country, isDefault } = req.body;
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ success: false, message: 'அணுகல் மறுக்கப்பட்டது!' });

      if (isDefault) {
        await (prisma as any).address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      const newAddress = await (prisma as any).address.create({
        data: { userId, street, city, province, postalCode, country: country || 'Sri Lanka', isDefault: isDefault || false }
      });

      return res.status(201).json({ success: true, message: '✅ முகவரி வெற்றிகரமாகச் சேர்க்கப்பட்டது!', data: newAddress });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // 📋 பயனரின் அனைத்து முகவரிகளையும் பெறுதல்
  static async getMyAddresses(req: AuthenticatedRequest, res: Response) {
    try {
      const addresses = await (prisma as any).address.findMany({
        where: { userId: req.user?.id }
      });
      return res.json({ success: true, data: addresses });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
    
  } // <--- இந்த பிராக்கெட் விடுபட்டிருந்தது

  // ✏️ Update Address
  static async updateAddress(req: Request, res: Response) {
    const { id } = req.params;
    return res.status(200).json({
      success: true,
      message: `Address ${id} Updated Successfully`
    });
  }

  // ❌ Delete Address
  static async deleteAddress(req: Request, res: Response) {
    const { id } = req.params;
    return res.status(200).json({
      success: true,
      message: `Address ${id} Deleted Successfully`
    });
  }

} // கிளாஸை மூடும் பிராக்கெட்