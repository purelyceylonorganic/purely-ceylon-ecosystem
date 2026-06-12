import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ CREATE WAREHOUSE
export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body;

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        location,
      },
    });

    return res.json({
      success: true,
      message: "Warehouse created",
      data: warehouse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error creating warehouse",
    });
  }
};

// ✅ GET ALL WAREHOUSES
export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        inventory: true,
      },
    });

    return res.json({
      success: true,
      data: warehouses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching warehouses",
    });
  }
};