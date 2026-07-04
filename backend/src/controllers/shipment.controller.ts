import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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

    // 1. Bulk Order exists?
    const order = await prisma.bulkOrder.findUnique({
      where: { id: bulkOrderId }
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
export const getShipmentByBulkOrder = async (
  req: Request,
  res: Response
) => {
  try {

    const { bulkOrderId } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { bulkOrderId },
      include: {
        bulkOrder: true
      }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
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