import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//
// ============================
// ➕ ADD STOCK
// ============================
//
export const addStock = async (req: Request, res: Response) => {
  try {
    const { warehouseId, productId, quantity } = req.body;

    const qty = Number(quantity);

    if (!warehouseId || !productId || !qty) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let inventory = await prisma.inventory.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
    });

    // 🟢 Create if not exists
    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          warehouseId,
          productId,
          quantity: qty,
        },
      });
    } else {
      // 🟢 Update existing stock
      inventory = await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: inventory.quantity + qty,
        },
      });
    }

    // 🔄 Transaction log
    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        type: "STOCK_IN",
        quantity: qty,
      },
    });

    return res.json({
      success: true,
      message: "Stock added successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Add Stock Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding stock",
    });
  }
};

//
// ============================
// ➖ REMOVE STOCK
// ============================
//
export const removeStock = async (req: Request, res: Response) => {
  try {
    const { warehouseId, productId, quantity } = req.body;

    const qty = Number(quantity);

    if (!warehouseId || !productId || !qty) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    if (inventory.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock",
      });
    }

    const updated = await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: inventory.quantity - qty,
      },
    });

    // 🔄 Transaction log
    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        type: "STOCK_OUT",
        quantity: qty,
      },
    });

    // ⚠️ LOW STOCK CHECK (safe)
    if (updated.quantity <= inventory.minStockLevel) {
      const existingAlert = await prisma.stockAlert.findFirst({
        where: {
          productId,
          isResolved: false,
        },
      });

      if (!existingAlert) {
        await prisma.stockAlert.create({
          data: {
            productId,
            message: `Low stock alert: only ${updated.quantity} left`,
          },
        });
      }
    }

    return res.json({
      success: true,
      message: "Stock removed successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Remove Stock Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing stock",
    });
  }
};

//
// ============================
// 📦 GET ALL INVENTORY
// ============================
//
export const getInventory = async (req: Request, res: Response) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        warehouse: true,
        product: true,
        transactions: true,
      },
    });

    return res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Get Inventory Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching inventory",
    });
  }
};

//
// ============================
// ⚠️ LOW STOCK ITEMS
// ============================
//
export const getLowStock = async (req: Request, res: Response) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    const lowStock = inventory.filter(
      (item) => item.quantity <= item.minStockLevel
    );

    return res.json({
      success: true,
      count: lowStock.length,
      data: lowStock,
    });
  } catch (error) {
    console.error("Low Stock Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching low stock",
    });
  }
};