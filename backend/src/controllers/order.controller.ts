import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export class OrderController {
  // 🚀 1. புதிய ஆர்டர் உருவாக்குதல் (Checkout & Order Placement)
  static async placeOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.Id;
      const { items, addressId, paymentMethod, shippingCost } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: '❌ உங்கள் கார்ட் காலியாக உள்ளது!' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: '❌ பயனர் விபரம் கண்டறியப்படவில்லை!' });
      }

      let totalAmount = 0;
      const orderItemsData = [];

      // ஒவ்வொரு பொருளின் விலையையும் டேட்டாபேசில் இருந்து நேரடியாகச் சரிபார்த்தல் (Security Check)
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `❌ தயாரிப்பு கையிருப்பில் இல்லை அல்லது போதிய அளவு இல்லை: ${product?.name || 'Unknown'}` 
          });
        }
        
        const itemTotal = product.basePrice * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.basePrice
        });

        // 📉 களஞ்சிய இருப்பை தானாகக் குறைத்தல் (Stock Auto-Deduction)
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity }
        });
      }

      // இலங்கை நுகர்வோர் வரி (VAT & SSCL) கணக்கீடு - மாதிரி மாதிரி அமைப்பு
      const taxAmount = totalAmount * 0.18; // 18% VAT & SSCL கணக்கீடு
      const finalTotal = totalAmount + taxAmount + parseFloat(shippingCost || '0');

      // 💾 ஒரே பரிவர்த்தனையாக ஆர்டரை டேட்டாபேசில் சேமித்தல் (Database Transaction)
      const newOrder = await prisma.order.create({
        data: {
          userId: userId,
          totalAmount: finalTotal,
          taxAmount,
          shippingCost: parseFloat(shippingCost || '0'),
          paymentMethod,
          status: 'PENDING',
          paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PAID',
          items: {
            create: orderItemsData
          }
        },
        include: { items: true }
      });

      // 🛡️ பாதுகாப்பு தணிக்கை பதிவு (Prisma schema does not define an AuditLog model)
      // If an audit log model is added to Prisma schema, restore this section.

      return res.status(201).json({ 
        success: true, 
        message: '✅ உங்களது ஆர்டர் வெற்றிகரமாக ஏற்றுக்கொள்ளப்பட்டது!', 
        orderId: newOrder.id,
        data: newOrder 
      });

    } catch (error: any) {
      return res.status(500).json({ success: false, message: '❌ செக்கவுட் செய்ய முடியவில்லை!', error: error.message });
    }
  }

   // 📋 2. ஒரு குறிப்பிட்ட வாடிக்கையாளரின் ஆர்டர் வரலாற்றைப் பெறுதல்
static async getMyOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.Id; // இதை அப்படியே string ஆக பயன்படுத்தவும்
    
    if (!userId) {
      return res.status(401).json({ success: false, message: '❌ பயனர் விபரம் கண்டறியப்படவில்லை!' });
    }

    // Number(userId) என்பதை நீக்கிவிட்டு நேரடியாக userId-ஐப் பயன்படுத்தவும்
    const orders = await prisma.order.findMany({
      where: { userId }, // இப்போது பிழை வராது
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
}