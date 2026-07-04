import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { calculateVolumeDiscount } from "../utils/volumeDiscount";
import { calculateEnterprisePrice } from "../utils/enterprisePricing";

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
      rfq.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // ✅ திருத்தம் செய்யப்பட்டது: Product Pricing Module செய்யும் வரை தற்காலிகமாக 10 என வைக்கப்பட்டுள்ளது
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
    const bulkOrder = await prisma.$transaction(async (tx) => {
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
// 🔍 GET SINGLE BULK ORDER
// ======================================
export const getBulkOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.bulkOrder.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Bulk Order not found" });
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

    // ✅ திருத்தம் செய்யப்பட்டது: bulkOrder-ல் இருந்து remarks நீக்கப்பட்டு, statusHistory-ல் மட்டும் சேமிக்கப்படுகிறது
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
      }
    });

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