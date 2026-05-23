import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LoggerService {
  
  // 🔴 1. கடுமையான சிஸ்டம் எரர்களைப் பதிவு செய்தல் (Critical System Failures)
  static async logError(context: string, errorMessage: string, stack?: string) {
    const timestamp = new Date().toISOString();
    
    // கன்சோலில் தெளிவாகக் காட்டுவதற்கான கட்டமைப்பு
    console.error(`[🚨 CRITICAL ERROR] [${timestamp}] [${context}]: ${errorMessage}`);
    if (stack) console.error(stack);

    try {
      // பிரியஸ்மா ஆடிட் லாக்கில் தானாகப் பதிவு செய்தல்
      if ((prisma as any).auditLog) {
        await (prisma as any).auditLog.create({
          data: {
            action: `ERROR_${context.toUpperCase()}`,
            details: `பிழை: ${errorMessage} | நேரம்: ${timestamp}`
          }
        });
      }
    } catch (dbError) {
      console.error('⚠️ Database logging failed:', dbError);
    }
  }

  // 🟢 2. வணிகப் பரிவர்த்தனைகளைக் கண்காணித்தல் (Commerce & Order Tracker)
  static async logInfo(action: string, details: string) {
    const timestamp = new Date().toISOString();
    console.log(`[ℹ️ INFO] [${timestamp}] [${action}]: ${details}`);

    try {
      if ((prisma as any).auditLog) {
        await (prisma as any).auditLog.create({
          data: {
            action,
            details: `${details} (நேரம்: ${timestamp})`
          }
        });
      }
    } catch (dbError) {
      console.error('⚠️ Database logging failed:', dbError);
    }
  }
}