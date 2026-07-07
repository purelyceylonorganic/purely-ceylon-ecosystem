import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// 1. RFQ Ownership Verification
// ==========================================
export const verifyRFQOwnership = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const rfq = await prisma.rFQ.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found"
      });
    }

    if (
      req.user.role !== "SUPER_ADMIN" &&
      req.user.role !== "ADMIN" &&
      rfq.buyerId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. Bulk Order Ownership Verification (❌ இது விடுபட்டிருந்தது, இப்போது சேர்க்கப்பட்டுள்ளது!)
// ==========================================
export const verifyBulkOrderOwnership = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const bulkOrder = await prisma.bulkOrder.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!bulkOrder) {
      return res.status(404).json({
        success: false,
        message: "Bulk Order not found"
      });
    }

    // SUPER_ADMIN மற்றும் ADMIN-க்கு முழு அனுமதி உண்டு, BUYER தன் சொந்த ஆர்டரை மட்டுமே பார்க்க முடியும்
    if (
      req.user.role !== "SUPER_ADMIN" &&
      req.user.role !== "ADMIN" &&
      bulkOrder.buyerId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};