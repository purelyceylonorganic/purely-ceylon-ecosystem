import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { calculateVolumeDiscount } from "../utils/volumeDiscount";
import { calculateEnterprisePrice } from "../utils/enterprisePricing";
import { sendPaymentReceivedNotification } from "../services/notification";
import { createAuditLog } from "../services/audit";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { MODULES } from "../constants/modules";

const prisma = new PrismaClient();

// ======================================
// BULK ORDER STATUS WORKFLOW
// ======================================
const BULK_ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  PACKING: "PACKING",
  QUALITY_CHECK: "QUALITY_CHECK",
  READY_FOR_EXPORT: "READY_FOR_EXPORT",
  CUSTOMS_CLEARANCE: "CUSTOMS_CLEARANCE",
  SHIPPED: "SHIPPED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
};

const statusFlow: Record<string, string[]> = {
  PENDING: ["CONFIRMED"],
  CONFIRMED: ["PAYMENT_RECEIVED"],
  PAYMENT_RECEIVED: ["PACKING"],
  PACKING: ["QUALITY_CHECK"],
  QUALITY_CHECK: ["READY_FOR_EXPORT"],
  READY_FOR_EXPORT: ["CUSTOMS_CLEARANCE"],
  CUSTOMS_CLEARANCE: ["SHIPPED"],
  SHIPPED: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: []
};

// ======================================
// 🔄 RFQ → BULK ORDER CONVERSION
// ======================================
export const convertRFQToBulkOrder = async (req: Request, res: Response) => {
  try {
    const { rfqId } = req.params;

    // 1️⃣ Fetch RFQ
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: { items: true }
    });

    if (!rfq) {
      return res.status(404).json({ success: false, message: "RFQ not found" });
    }

    // Get Buyer
    const buyer = await prisma.wholesaleBuyer.findUnique({
      where: { id: rfq.buyerId }
    });

    if (!buyer) {
      return res.status(404).json({ success: false, message: "Buyer not found" });
    } 

    // 2️⃣ Status validation
    if (!["ACCEPTED", "QUOTED"].includes(rfq.status)) {
      return res.status(400).json({ success: false, message: "RFQ not ready for conversion" });
    }

    // 3️⃣ Prevent duplicate conversion
    const existing = await prisma.bulkOrder.findFirst({
      where: { rfqId: rfq.id }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Bulk Order already exists for this RFQ" });
    }

    // 4️⃣ Resolve pricing concurrently
    const bulkOrderItems = await Promise.all(
      rfq.items.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const actualBasePrice = 10;

        // 5️⃣ Enterprise Pricing (Tier-based)
        const enterprise = calculateEnterprisePrice({
          basePrice: actualBasePrice,
          quantity: item.quantity,
          tier: buyer.tier
        });

        // 6️⃣ Volume Discount
        const volume = calculateVolumeDiscount(item.quantity);

        // 7️⃣ Final Price Calculation
        const finalUnitPrice = enterprise.finalPrice * (1 - volume.discount / 100);
        const lineTotal = finalUnitPrice * item.quantity;

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: finalUnitPrice,
          lineTotal
        };
      })
    );

    // Safe Aggregation
    const totalAmount = bulkOrderItems.reduce((sum, item) => sum + item.lineTotal, 0);

    // 8️⃣ Atomic Transaction for Conversion
    const bulkOrder = await prisma.$transaction(async (tx: any) => {
      const order = await tx.bulkOrder.create({
        data: {
          buyerId: rfq.buyerId,
          rfqId: rfq.id,
          status: "PENDING",
          totalAmount,
          items: {
            create: bulkOrderItems.map(({ productId, quantity, price }) => ({
              productId,
              quantity,
              price
            }))
          }
        },
        include: { items: true }
      });

      await tx.rFQ.update({
        where: { id: rfqId },
        data: { status: "CONVERTED" }
      });

      return order;
    });

    // ✅ Safe Audit Log Call after creation
    try {
      await createAuditLog({
        userId: buyer.id,
        userEmail: buyer.email,
        action: AUDIT_ACTIONS.BULK_ORDER_CREATED,
        module: MODULES.BULK_ORDER,
        entityId: bulkOrder.id,
        description: "RFQ converted into Bulk Order",
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined
      });
    } catch (auditError) {
      console.error("Audit Log Error (Bulk Order Created):", auditError);
    }

    return res.status(201).json({
      success: true,
      message: "Bulk Order created successfully under Purely Ceylon Organic (Pvt) Ltd compliance architecture",
      data: bulkOrder
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// 📦 GET MY BULK ORDERS
// ======================================
export const getMyBulkOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const buyer = await prisma.wholesaleBuyer.findUnique({
      where: { email: user.email }
    });

    if (!buyer) {
      return res.status(404).json({ success: false, message: "Buyer not found" });
    }

    const orders = await prisma.bulkOrder.findMany({
      where: { buyerId: buyer.id },
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// 🔍 GET SINGLE BULK ORDER (With Ownership Validation)
// ======================================
export const getBulkOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user; // 🚀 லாக்-இன் செய்த பயனர் விவரங்கள் (JWT-லிருந்து)

    // 💡 findUnique-க்கு பதிலாக findFirst பயன்படுத்த வேண்டும் (ஏனெனில் பல நிபந்தனைகள் உள்ளன)
    const order = await prisma.bulkOrder.findFirst({
      where: { 
        id,
        // பயனர் BUYER ஆக இருந்தால், அவருடைய சொந்த buyerId ஆக இருக்க வேண்டும்.
        // ஒருவேளை ADMIN / SUPER_ADMIN ஆக இருந்தால், அவர்கள் எல்லார் ஆர்டரையும் பார்க்கலாம் (undefined)
        buyerId: user.role === "BUYER" ? user.id : undefined
      },
      include: { items: true }
    });

    // 🔒 ஆர்டர் இல்லை என்றாலோ அல்லது வேறு பையரின் ஆர்டர் என்றாலோ 404/403 காட்டும்
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Bulk Order not found or Unauthorized" 
      });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// 🔄 UPDATE BULK ORDER STATUS
// ======================================
export const updateBulkOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = Object.values(BULK_ORDER_STATUS);

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid Status" });
    }

    // Find Order
    const order = await prisma.bulkOrder.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ success: false, message: "Bulk Order not found" });
    }

    const allowedStatus = statusFlow[order.status] || [];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Status Transition: ${order.status} → ${status}`
      });
    }

    console.log("Old Status :", order.status);
    console.log("New Status :", status);

    const updatedAt = new Date();

    const [updatedOrder] = await prisma.$transaction([
      prisma.bulkOrder.update({
        where: { id },
        data: { status, updatedAt }, 
        include: {
          statusHistory: {
            orderBy: { createdAt: "desc" }
          }
        }
      }),
      prisma.bulkOrderStatusHistory.create({
        data: {
          bulkOrderId: id,
          previousStatus: order.status,
          currentStatus: status,
          remarks: remarks || null
        }
      })
    ]);

    // ✅ Safe Audit Log Call after status update
    try {
      const actor = (req as any).user; 
      await createAuditLog({
        userId: actor?.id,
        userEmail: actor?.email,
        action: AUDIT_ACTIONS.BULK_ORDER_STATUS_UPDATED,
        module: MODULES.BULK_ORDER,
        entityId: id,
        description: `${order.status} → ${status}`,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined
      });
    } catch (auditError) {
      console.error("Audit Log Error (Status Updated):", auditError);
    }

    return res.status(200).json({
      success: true,
      message: "Bulk Order Status Updated Successfully",
      data: updatedOrder,
      workflow: {
        previousStatus: order.status,
        currentStatus: status,
        updatedAt,
        remarks: remarks || null
      }
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 💳 PAY BULK ORDER
// ===============================
export const payBulkOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const order = await prisma.bulkOrder.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ success: false, message: "Bulk Order not found" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ success: false, message: "Bulk Order already paid" });
    }

    const updated = await prisma.bulkOrder.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        status: "PAYMENT_RECEIVED",
        paymentMethod,
        transactionId,
        paidAt: new Date()
      },
      include: {
        buyer: true
      }
    });

    // 🔔 Email Notification
    try {
      await sendPaymentReceivedNotification(
        updated.buyer.email,
        updated.buyer.name
      );
    } catch (error) {
      console.error("Notification Error:", error);
    }

    // ✅ Safe Audit Log Call after payment confirmation
    try {
      await createAuditLog({
        userId: updated.buyer.id,
        userEmail: updated.buyer.email,
        action: AUDIT_ACTIONS.PAYMENT_RECEIVED,
        module: MODULES.PAYMENT,
        entityId: id,
        description: "Bulk Order payment completed",
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined
      });
    } catch (auditError) {
      console.error("Audit Log Error (Payment Received):", auditError);
    }

    return res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      data: updated
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 📜 GET BULK ORDER HISTORY
// ===============================
export const getBulkOrderHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const history = await prisma.bulkOrderStatusHistory.findMany({
      where: { bulkOrderId: id },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};