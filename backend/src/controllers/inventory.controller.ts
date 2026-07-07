import { Request, Response } from "express";
import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

//
// ============================
// ➕ ADD STOCK
// ============================
//
export const addStock = async (req: Request, res: Response) => {
  try {
    const { warehouseId, productVariantId, quantity } = req.body;

    const qty = Number(quantity);

    if (!warehouseId || !productVariantId || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "warehouseId, productVariantId and quantity are required",
      });
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    const productVariant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
    });

    if (!productVariant) {
      return res.status(404).json({
        success: false,
        message: "Product Variant not found",
      });
    }

    let inventory = await prisma.inventory.findUnique({
      where: {
        warehouseId_productVariantId: {
          warehouseId,
          productVariantId,
        },
      },
    });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          warehouseId,
          productVariantId,
          quantity: qty,
        },
      });
    } else {
      inventory = await prisma.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          quantity: inventory.quantity + qty,
        },
      });
    }

    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        type: TransactionType.STOCK_IN,
        quantity: qty,
      },
    });

    return res.status(200).json({
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
    const { warehouseId, productVariantId, quantity } = req.body;

    const qty = Number(quantity);

    if (!warehouseId || !productVariantId || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "warehouseId, productVariantId and quantity are required",
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: {
        warehouseId_productVariantId: {
          warehouseId,
          productVariantId,
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

    const updatedInventory = await prisma.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        quantity: inventory.quantity - qty,
      },
    });

    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        type: TransactionType.STOCK_OUT,
        quantity: qty,
      },
    });

    // Low Stock Alert
    if (
      updatedInventory.quantity <=
      updatedInventory.minStockLevel
    ) {
      const existingAlert =
        await prisma.stockAlert.findFirst({
          where: {
            inventoryId: inventory.id,
            isResolved: false,
          },
        });

      if (!existingAlert) {
        await prisma.stockAlert.create({
          data: {
            inventoryId: inventory.id,
            message: `Low stock alert: only ${updatedInventory.quantity} items left`,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Stock removed successfully",
      data: updatedInventory,
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
// 📦 GET INVENTORY
// ============================
//
export const getInventory = async (
  req: Request,
  res: Response
) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        warehouse: true,
        productVariant: true,
        transactions: true,
      },
    });

    return res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    console.error("Inventory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching inventory",
    });
  }
};

//
// ============================
// ⚠️ LOW STOCK
// ============================
//
export const getLowStock = async (
  req: Request,
  res: Response
) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        warehouse: true,
        productVariant: true,
      },
    });

    const lowStock = inventory.filter(
      (item: any) =>
        item.quantity <= item.minStockLevel
    );

    return res.status(200).json({
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

//
// ============================
// 📜 STOCK TRANSACTIONS
// ============================
//
export const getTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const transactions =
      await prisma.inventoryTransaction.findMany({
        include: {
          inventory: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching transactions",
    });
  }
};