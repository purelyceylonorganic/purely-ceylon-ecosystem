import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//
// ============================
// 🏢 CREATE WAREHOUSE
// ============================
//
export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Name and location are required",
      });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        location,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse,
    });
  } catch (error) {
    console.error("Create Warehouse Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating warehouse",
    });
  }
};

//
// ============================
// 📦 GET ALL WAREHOUSES
// ============================
//
export const getAllWarehouses = async (req: Request, res: Response) => {
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
    console.error("Get Warehouses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching warehouses",
    });
  }
};

//
// ============================
// 📦 GET SINGLE WAREHOUSE
// ============================
//
export const getWarehouseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            productVariant: true,
            transactions: true,
          },
        },
      },
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    return res.json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    console.error("Get Warehouse Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching warehouse",
    });
  }
};

//
// ============================
// ✏️ UPDATE WAREHOUSE
// ============================
//
export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        name,
        location,
      },
    });

    return res.json({
      success: true,
      message: "Warehouse updated successfully",
      data: warehouse,
    });
  } catch (error) {
    console.error("Update Warehouse Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating warehouse",
    });
  }
};

//
// ============================
// 🗑️ DELETE WAREHOUSE
// ============================
//
export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.warehouse.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.error("Delete Warehouse Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting warehouse",
    });
  }
};