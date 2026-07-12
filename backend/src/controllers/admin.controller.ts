import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";

const prisma = new PrismaClient();

// ==========================================
// 📊 DASHBOARD SUMMARY & ANALYTICS
// ==========================================
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();

    let totalRevenueAmount = 0;
    try {
      const totalRevenue = await prisma.order.aggregate({
        _sum: { totalFinal: true },
      });
      totalRevenueAmount = totalRevenue._sum.totalFinal || 0;
    } catch (e) {
      console.warn("Revenue calculation warning (Stats):", e);
    }

    let lowStockCount = 0;
    try {
      const inventoryItems = await prisma.inventory.findMany({
        select: { quantity: true, minStockLevel: true },
      });
      const lowStockItems = inventoryItems.filter(
        (item: any) => item.quantity <= item.minStockLevel
      );
      lowStockCount = lowStockItems.length;
    } catch (e) {
      console.warn("Inventory table missing or error:", e);
    }

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenueAmount,
        lowStockCount,
      },
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Dashboard error",
      error: error?.message || error,
    });
  }
};

export const getRevenueDashboard = async (req: Request, res: Response) => {
  try {
    let revenueSum = 0;
    try {
      const revenue = await prisma.order.aggregate({
        _sum: { totalFinal: true },
      });
      revenueSum = revenue._sum.totalFinal || 0;
    } catch (e: any) {
      console.error("Prisma _sum Error:", e.message);
    }

    const orders = await prisma.order.count();

    const customers = await prisma.user.count({
      where: { 
        role: { equals: "CUSTOMER" as any } 
      },
    });

    const delivered = await prisma.order.count({
      where: { 
        status: { equals: "DELIVERED" as any } 
      },
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return res.json({
      success: true,
      data: {
        revenue: revenueSum,
        orders,
        customers,
        delivered,
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error("Revenue Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Dashboard Error",
      error: error?.message || "Unknown Database Error",
    });
  }
};

export const getMonthlySales = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        totalFinal: true,
        createdAt: true
      }
    });

    const monthlyData: any = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    };

    orders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleString("en-US", { month: "short" });
      if (monthlyData[month] !== undefined) {
        monthlyData[month] += order.totalFinal;
      }
    });

    return res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const getTopProductsAndCustomers = async (req: Request, res: Response) => {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productVariantId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5
    });

    const topCustomers = await prisma.user.findMany({
      include: { orders: true },
      take: 5
    });

    return res.json({
      success: true,
      topProducts,
      topCustomers
    });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

// ==========================================
// 📄 EXPORT DATA CONTROLLERS
// ==========================================

export const exportRevenuePDF = async (req: Request, res: Response) => {
  try {
    const revenueSum = await prisma.order.aggregate({ _sum: { totalFinal: true } });
    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" as any } });
    const deliveredOrders = await prisma.order.count({ where: { status: "DELIVERED" as any } });
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Revenue_Report.pdf");
    doc.pipe(res);

    doc.fillColor("#0E4B32").fontSize(24).text("Purely Ceylon - Revenue Report", { align: "center" });
    doc.fontSize(10).fillColor("#555555").text(`Generated Date: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(2);

    doc.fillColor("#333").fontSize(14).text("Summary Metrics", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#000")
       .text(`Total Revenue: $${revenueSum._sum.totalFinal || 0}`)
       .text(`Total Orders: ${totalOrders}`)
       .text(`Total Customers: ${totalCustomers}`)
       .text(`Delivered Orders: ${deliveredOrders}`);
    
    doc.moveDown(2);

    doc.fontSize(14).fillColor("#333").text("Recent 5 Orders", { underline: true });
    doc.moveDown(1);

    recentOrders.forEach((order, index) => {
      doc.fontSize(11).fillColor("#000")
         .text(`${index + 1}. ID: #${order.id.slice(0, 8).toUpperCase()} | Customer: ${order.user?.fullName || "Guest"} | Total: $${order.totalFinal} | Status: ${order.status}`);
      doc.moveDown(0.5);
    });

    doc.end();

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: "PDF generation failed" });
  }
};

// ==========================================
// 👥 DATA RETRIEVAL CONTROLLERS (GET ALL)
// ==========================================

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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Error fetching users", error: error?.message });
  }
};

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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Error fetching orders", error: error?.message });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        category: true,
      },
    });
    return res.json({ success: true, data: products });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Error fetching products", error: error?.message });
  }
};

// ==========================================
// 🏆 TOP SELLING PRODUCTS & CUSTOMERS
// ==========================================
export const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    const items = await prisma.orderItem.findMany({
      include: {
        productVariant: {
          include: {
            product: true
          }
        }
      }
    });

    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    items.forEach((item: any) => {
      const productName = item.productVariant?.product?.name || "Unknown Product";

      if (!productMap[productName]) {
        productMap[productName] = {
          name: productName,
          quantity: 0,
          revenue: 0
        };
      }

      productMap[productName].quantity += item.quantity;
      productMap[productName].revenue += item.quantity * item.price;
    });

    const result = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Top Products Error"
    });
  }
};

export const getTopCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER" as any
      },
      include: {
        orders: true
      }
    });

    const result = customers.map((customer) => {
      const revenue = customer.orders.reduce(
        (sum, order) => sum + Number(order.totalFinal || 0),
        0
      );

      return {
        id: customer.id,
        name: customer.fullName,
        email: customer.email,
        orders: customer.orders.length,
        revenue
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Top Customers Error"
    });
  }
};

// ==========================================
// 🌍 NEW ANALYTICS & NOTIFICATIONS
// ==========================================

export const getRevenueByCountry = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        address: true,
      },
    });

    const countryRevenue: any = {};

    orders.forEach((order) => {
      const country = order.address?.country || "Unknown";

      if (!countryRevenue[country]) {
        countryRevenue[country] = 0;
      }

      countryRevenue[country] += Number(order.totalFinal);
    });

    const result = Object.keys(countryRevenue)
      .map((country) => ({
        country,
        revenue: countryRevenue[country],
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Country Analytics Error",
    });
  }
};

export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    const pendingShipments = await prisma.order.count({
      where: {
        shippingStatus: "PENDING" as any
      }
    });

    const unpaidOrders = await prisma.order.count({
      where: {
        paymentStatus: "UNPAID" as any
      }
    });

    const lowStockProducts = await prisma.inventory.count({
      where: {
        quantity: {
          lte: 10
        }
      }
    });

    return res.json({
      success: true,
      data: {
        newOrders,
        pendingShipments,
        unpaidOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Notification Error"
    });
  }
};

export const getKPIAnalytics = async (req: Request, res: Response) => {
  try {
    const revenueGrowth = 12.5;
    const orderGrowth = 8.3;
    const customerGrowth = 25.0;
    const deliveredGrowth = -5.0;

    return res.json({
      success: true,
      data: {
        revenueGrowth,
        orderGrowth,
        customerGrowth,
        deliveredGrowth
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false
    });
  }
};