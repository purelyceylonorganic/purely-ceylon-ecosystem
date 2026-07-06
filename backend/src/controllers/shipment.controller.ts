import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendShipmentNotification } from "../services/notification";
import { createAuditLog } from "../services/audit";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { MODULES } from "../constants/modules";

const prisma = new PrismaClient();

const generateShipmentNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SHP-${year}-${random}`;
};

export const createShipment = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      bulkOrderId,
      shippingLine,
      containerNumber,
      vesselName,
      trackingNumber,
      portOfLoading,
      destinationPort,
      etd,
      eta
    } = req.body;
    
    const user = (req as any).user; // 🚀 லாக்-இன் செய்த பயனர் (Audit லாக்கிற்காக)

    // 1. Bulk Order exists? (Include buyer for Email & Company details)
    const order = await prisma.bulkOrder.findUnique({
      where: { id: bulkOrderId },
      include: { buyer: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Bulk Order not found"
      });
    }

    // 2. Prevent duplicate shipment
    const existingShipment = await prisma.shipment.findUnique({
      where: { bulkOrderId }
    });

    if (existingShipment) {
      return res.status(400).json({
        success: false,
        message: "Shipment already exists for this order"
      });
    }

    // 3. Create Shipment
    const shipment = await prisma.shipment.create({
      data: {
        shipmentNumber: generateShipmentNumber(),
        bulkOrderId,
        shippingLine,
        containerNumber,
        vesselName,
        trackingNumber,
        portOfLoading,
        destinationPort,
        etd: etd ? new Date(etd) : null,
        eta: eta ? new Date(eta) : null
      }
    });

    // 4. Update Bulk Order Shipment Status to SHIPPED
    await prisma.bulkOrder.update({
      where: { id: bulkOrderId },
      data: { status: "SHIPPED" }
    });

    // ✅ Safe Shipment Notification Call
    try {
      if (order.buyer) {
        await sendShipmentNotification(
          order.buyer.email,
          order.buyer.name || "Wholesale Buyer"
        );
      }
    } catch (notifError) {
      console.error("Notification Error (Shipment):", notifError);
    }

    // ✅ Safe Audit Log Call after shipment creation (User ID சேர்க்கப்பட்டுள்ளது)
    try {
      await createAuditLog({
        userId: user?.id, // 👈 லாக்-இன் செய்த அட்மின்/மேலாளர் ID
        action: AUDIT_ACTIONS.SHIPMENT_CREATED,
        module: MODULES.SHIPMENT,
        entityId: shipment.id,
        description: "Shipment booked successfully",
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined
      });
    } catch (auditError) {
      console.error("Audit Log Error (Shipment Created):", auditError);
    }

    return res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      data: shipment
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================
// 🔍 GET SHIPMENT BY BULK ORDER (With Ownership Validation)
// ======================================
export const getShipmentByBulkOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const { bulkOrderId } = req.params;
    const user = (req as any).user; // 🚀 லாக்-இன் செய்த பயனர் விவரங்கள்

    // 💡 findUnique-க்கு பதிலாக findFirst பயன்படுத்தப்பட்டுள்ளது
    const shipment = await prisma.shipment.findFirst({
      where: { 
        bulkOrderId,
        // 🔒 பயனர் BUYER ஆக இருந்தால், அந்த பல்க் ஆர்டரின் buyerId அவருடையதாக இருக்க வேண்டும்!
        bulkOrder: user.role === "BUYER" ? { buyerId: user.id } : undefined
      },
      include: {
        bulkOrder: true
      }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found or Unauthorized"
      });
    }

    return res.status(200).json({
      success: true,
      data: shipment
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};