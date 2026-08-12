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
        message:
          "warehouseId, productVariantId and quantity are required",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // ============================
      // CHECK WAREHOUSE
      // ============================

      const warehouse = await tx.warehouse.findUnique({
        where: {
          id: warehouseId,
        },
      });

      if (!warehouse) {
        throw new Error("Warehouse not found");
      }

      // ============================
      // CHECK PRODUCT VARIANT
      // ============================

      const productVariant = await prisma.productVariant.findUnique({
  where: {
    id: productVariantId,
  },
});

if (!productVariant) {
  return res.status(404).json({
    success: false,
    message: "Product Variant not found",
  });
}

      // ============================
      // FIND / CREATE INVENTORY
      // ============================

      let inventory =
        await tx.inventory.findUnique({
          where: {
            warehouseId_productVariantId: {
              warehouseId,
              productVariantId,
            },
          },
        });

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            warehouseId,
            productVariantId,
            quantity: qty,
          },
        });
      } else {
        inventory = await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            quantity: {
              increment: qty,
            },
          },
        });
      }

      // ============================
      // UPDATE PRODUCT VARIANT STOCK
      // ============================

      const updatedProductVariant =
        await tx.productVariant.update({
          where: {
            id: productVariantId,
          },
          data: {
            stock: {
              increment: qty,
            },
          },
        });

      // ============================
      // CREATE TRANSACTION
      // ============================

      await tx.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          type: TransactionType.STOCK_IN,
          quantity: qty,
        },
      });

      return {
        inventory,
        productVariant: updatedProductVariant,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Stock added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Add Stock Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error adding stock",
    });
  }
};

//
// ============================
// ➖ REMOVE STOCK
// ============================
//
export const removeStock = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      warehouseId,
      productVariantId,
      quantity,
    } = req.body;

    const qty = Number(quantity);

    if (!warehouseId || !productVariantId || qty <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "warehouseId, productVariantId and quantity are required",
      });
    }

    // ============================
    // CHECK WAREHOUSE
    // ============================

    const warehouse = await prisma.warehouse.findUnique({
      where: {
        id: warehouseId,
      },
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // ============================
    // CHECK PRODUCT VARIANT
    // ============================

    const productVariant =
      await prisma.productVariant.findUnique({
        where: {
          id: productVariantId,
        },
      });

    if (!productVariant) {
      return res.status(404).json({
        success: false,
        message: "Product Variant not found",
      });
    }

    // ============================
    // FIND INVENTORY
    // ============================

    const inventory =
      await prisma.inventory.findUnique({
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

    // ============================
    // CHECK INVENTORY STOCK
    // ============================

    if (inventory.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: "Not enough inventory stock",
      });
    }

    // ============================
    // CHECK PRODUCT VARIANT STOCK
    // ============================

    if (productVariant.stock < qty) {
      return res.status(400).json({
        success: false,
        message: "Not enough product variant stock",
      });
    }

    // ============================
    // DATABASE TRANSACTION
    // ============================

    const result = await prisma.$transaction(
      async (tx) => {

        // ============================
        // UPDATE INVENTORY
        // ============================

        const updatedInventory =
          await tx.inventory.update({
            where: {
              id: inventory.id,
            },
            data: {
              quantity: {
                decrement: qty,
              },
            },
          });

        // ============================
        // UPDATE PRODUCT VARIANT STOCK
        // ============================

        const updatedProductVariant =
          await tx.productVariant.update({
            where: {
              id: productVariantId,
            },
            data: {
              stock: {
                decrement: qty,
              },
            },
          });

        // ============================
        // CREATE TRANSACTION
        // ============================

        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,
            type: TransactionType.STOCK_OUT,
            quantity: qty,
          },
        });

        // ============================
        // LOW STOCK ALERT
        // ============================

        if (
          updatedInventory.quantity <=
          updatedInventory.minStockLevel
        ) {
          const existingAlert =
            await tx.stockAlert.findFirst({
              where: {
                inventoryId: inventory.id,
                isResolved: false,
              },
            });

          if (!existingAlert) {
            await tx.stockAlert.create({
              data: {
                inventoryId: inventory.id,
                message: `Low stock alert: only ${updatedInventory.quantity} items left`,
              },
            });
          }
        }

        return {
          inventory: updatedInventory,
          productVariant: updatedProductVariant,
        };
      }
    );

    // ============================
    // SUCCESS RESPONSE
    // ============================

    return res.status(200).json({
      success: true,
      message: "Stock removed successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "Remove Stock Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error removing stock",
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
    productVariant: {
      include: {
        product: {
          include: {
            category: true,
            images: true,
          },
        },
      },
    },
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

    productVariant: {
      include: {
        product: {
          include: {
            category: true,
            images: true,
          },
        },
      },
    },

    transactions: true,
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
      inventory: {
        include: {
          warehouse: true,
          productVariant: {
            include: {
              product: true,
            },
          },
        },
      },
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