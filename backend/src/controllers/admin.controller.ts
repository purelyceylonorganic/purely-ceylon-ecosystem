import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//
// ==========================
// 📊 DASHBOARD SUMMARY
// ==========================
//
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();

    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });

    const inventoryItems = await prisma.inventory.findMany({
      select: {
        quantity: true,
        minStockLevel: true,
      },
    });

    const lowStockItems = inventoryItems.filter(
      (item) => item.quantity <= item.minStockLevel
    );

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        lowStockCount: lowStockItems.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Dashboard error",
    });
  }
};

//
// ==========================
// 👤 GET ALL USERS
// ==========================
//
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

//
// ==========================
// 📦 GET ALL ORDERS
// ==========================
//
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

//
// ==========================
// 📦 PRODUCT MANAGEMENT
// ==========================
//
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        category: true,
      },
    });

    return res.json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching products" });
  }
};