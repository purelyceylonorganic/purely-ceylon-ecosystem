import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EnterpriseService {
  
  // 📱 1. மொபைல் ஆப்பிற்கான பிரத்யேக அதிவேக கேடலாக் டேட்டா (Mobile-Optimized Clean Feed)
  static async getMobileCatalog() {
    try {
      // மொபைல் டேட்டா பயன்பாட்டைக் குறைக்க (Minimize Data payload) தேவையான விபரங்களை மட்டும் எடுத்தல்
      const products = await (prisma as any).product.findMany({
        where: { inStock: true },
        select: {
          id: true,
          name: true,
          price: true,
          weight: true,
          sku: true
        }
      });
      return products;
    } catch (error: any) {
      throw new Error(`Mobile Catalog Error: ${error.message}`);
    }
  }

  // 🤖 2. ஸ்மார்ட் வணிகப் பரிந்துரை எஞ்சின் (Smart Cross-Selling AI/Algorithm)
  // ஒரு வாடிக்கையாளர் ஒரு பொருளைப் பார்க்கும்போது, அதற்குத் தொடர்புடைய பிற ஆர்கானிக் பொருட்களைப் பரிந்துரைக்கும்
  static async getSmartRecommendations(productId: string) {
    try {
      const currentProduct = await (prisma as any).product.findUnique({
        where: { id: productId }
      });

      if (!currentProduct) return [];

      // ஒரே கேட்டகிரியில் உள்ள பிற 3 பிரீமியம் தயாரிப்புகளைத் தானாகத் தேர்ந்தெடுத்தல்
      const recommendations = await (prisma as any).product.findMany({
        where: {
          category: currentProduct.category,
          NOT: { id: productId },
          inStock: true
        },
        take: 3
      });

      return recommendations;
    } catch (error: any) {
      throw new Error(`Recommendation Engine Error: ${error.message}`);
    }
  }
}