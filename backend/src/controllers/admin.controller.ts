import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  getLkrPerUsd,
  getRevenueSummaryLKR,
  round2,
  salesAmount,
  toLKR,
} from "../services/financeCalc.service";
import PDFDocument from "pdfkit";

const prisma = new PrismaClient();

// ==========================================
// 🏆 வாடிக்கையாளர் தரவரிசை (LKR) — password போன்றவை எப்போதும் வெளியே போகாது
// ==========================================
async function rankCustomers(limit: number) {
  const lkrPerUsd = await getLkrPerUsd();

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" as any },
    select: {
      id: true,
      fullName: true,
      email: true,
      orders: { select: { totalFinal: true, currency: true, status: true } },
    },
  });

  return customers
    .map((customer) => ({
      id: customer.id,
      name: customer.fullName,
      email: customer.email,
      orders: customer.orders.length,
      revenue: round2(
        customer.orders.reduce(
          (sum, order) =>
            sum +
            (order.status === "CANCELLED"
              ? 0
              : toLKR(order.totalFinal, order.currency, lkrPerUsd)),
          0
        )
      ),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}


// ==========================================
// 📊 DASHBOARD SUMMARY & ANALYTICS
// ==========================================
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalProducts, totalOrders, summary] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      getRevenueSummaryLKR(),
    ]);

    let lowStockCount = 0;
    try {
      const inventoryItems = await prisma.inventory.findMany({
        select: { quantity: true, minStockLevel: true },
      });
      lowStockCount = inventoryItems.filter(
        (item: any) => item.quantity <= item.minStockLevel
      ).length;
    } catch (e) {
      console.warn("Inventory table missing or error:", e);
    }

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: summary.received, // LKR (கைக்கு வந்த பணம் + Income)
        pendingRevenue: summary.pending,
        currency: "LKR",
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
    const [summary, orders, customers, delivered, recent] = await Promise.all([
      getRevenueSummaryLKR(),
      prisma.order.count(),
      prisma.user.count({ where: { role: { equals: "CUSTOMER" as any } } }),
      prisma.order.count({ where: { status: { equals: "DELIVERED" as any } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          totalFinal: true,
          currency: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          user: { select: { fullName: true } },
          items: {
            select: {
              id: true,
              quantity: true,
              productName: true,
              variantLabel: true,
              productVariant: {
                select: { weight: true, product: { select: { name: true } } },
              },
            },
          },
        },
      }),
    ]);

    const recentOrders = recent.map((order) => ({
      id: order.id,
      totalFinal: order.totalFinal,
      currency: order.currency,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      user: order.user,
      items: order.items.map((item) => {
        const base =
          item.productName || item.productVariant?.product?.name || "Product";
        const label = item.variantLabel || item.productVariant?.weight;
        return {
          id: item.id,
          quantity: item.quantity,
          name: label ? `${base} (${label})` : base,
        };
      }),
    }));

    return res.json({
      success: true,
      data: {
        currency: "LKR",
        revenue: summary.received,
        orderRevenue: summary.orderRevenue,
        otherIncome: summary.otherIncome,
        pendingRevenue: summary.pending,
        sales: summary.sales,
        receivedByCurrency: summary.receivedByCurrency,
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
    const year = Number(req.query.year) || new Date().getFullYear();
    const lkrPerUsd = await getLkrPerUsd();

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
      },
      select: {
        totalFinal: true,
        paidAmount: true,
        paymentStatus: true,
        status: true,
        currency: true,
        createdAt: true,
      },
    });

    const monthlyData: Record<string, number> = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
    };

    // ரத்து செய்யாத orders-ன் விற்பனை மதிப்பு (LKR)
    for (const order of orders) {
      const month = new Date(order.createdAt).toLocaleString("en-US", { month: "short" });
      if (monthlyData[month] !== undefined) {
        monthlyData[month] += toLKR(salesAmount(order), order.currency, lkrPerUsd);
      }
    }

    for (const key of Object.keys(monthlyData)) {
      monthlyData[key] = round2(monthlyData[key]);
    }

    return res.json({ success: true, currency: "LKR", year, data: monthlyData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};

export const getTopProductsAndCustomers = async (req: Request, res: Response) => {
  try {
    const grouped = await prisma.orderItem.groupBy({
      by: ["productVariantId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: grouped.map((g) => g.productVariantId) } },
      select: { id: true, weight: true, product: { select: { name: true } } },
    });

    const topProducts = grouped.map((g) => {
      const v = variants.find((x) => x.id === g.productVariantId);
      return {
        productVariantId: g.productVariantId,
        name: v ? `${v.product.name} (${v.weight})` : "Removed product",
        _sum: { quantity: g._sum.quantity ?? 0 },
      };
    });

    const ranked = await rankCustomers(5);

    return res.json({
      success: true,
      currency: "LKR",
      topProducts,
      topCustomers: ranked.map((c) => ({
        id: c.id,
        fullName: c.name,
        email: c.email,
        orderCount: c.orders,
        revenue: c.revenue,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};

// ==========================================
// 📄 EXPORT DATA CONTROLLERS
// ==========================================

export const exportRevenuePDF = async (req: Request, res: Response) => {
  try {
    const summary = await getRevenueSummaryLKR();
    const totalRevenueAmount = summary.received;
    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" as any } });
    const deliveredOrders = await prisma.order.count({ where: { status: "DELIVERED" as any } });
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { fullName: true } } }
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
       .text(`Total Revenue (received): LKR ${totalRevenueAmount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
       .text(`Total Orders: ${totalOrders}`)
       .text(`Total Customers: ${totalCustomers}`)
       .text(`Delivered Orders: ${deliveredOrders}`);
    
    doc.moveDown(2);

    doc.fontSize(14).fillColor("#333").text("Recent 5 Orders", { underline: true });
    doc.moveDown(1);

    recentOrders.forEach((order, index) => {
      doc.fontSize(11).fillColor("#000")
         .text(`${index + 1}. ID: #${order.id.slice(0, 8).toUpperCase()} | Customer: ${order.user?.fullName || "Guest"} | Total: ${order.currency} ${order.totalFinal} | Status: ${order.status}`);
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
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        items: {
          include: {
            productVariant: {
              select: { sku: true, weight: true, product: { select: { name: true } } },
            },
          },
        },
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
    const lkrPerUsd = await getLkrPerUsd();

    const items = await prisma.orderItem.findMany({
      where: { order: { status: { not: "CANCELLED" } } },
      select: {
        quantity: true,
        price: true,
        productName: true,
        order: { select: { currency: true } },
        productVariant: { select: { product: { select: { name: true } } } },
      },
    });

    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const item of items) {
      const name = item.productName || item.productVariant?.product?.name || "Unknown Product";

      if (!productMap[name]) {
        productMap[name] = { name, quantity: 0, revenue: 0 };
      }

      productMap[name].quantity += item.quantity;
      productMap[name].revenue += toLKR(item.quantity * item.price, item.order.currency, lkrPerUsd);
    }

    const result = Object.values(productMap)
      .map((p) => ({ ...p, revenue: round2(p.revenue) }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return res.json({ success: true, currency: "LKR", data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Top Products Error" });
  }
};

export const getTopCustomers = async (req: Request, res: Response) => {
  try {
    const ranked = await rankCustomers(10);
    return res.json({ success: true, currency: "LKR", data: ranked });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Top Customers Error" });
  }
};

// ==========================================
// 🌍 NEW ANALYTICS & NOTIFICATIONS
// ==========================================

export const getRevenueByCountry = async (req: Request, res: Response) => {
  try {
    const lkrPerUsd = await getLkrPerUsd();

    const orders = await prisma.order.findMany({
      select: {
        totalFinal: true,
        paidAmount: true,
        paymentStatus: true,
        status: true,
        currency: true,
        address: { select: { country: true } },
      },
    });

    const countryRevenue: Record<string, number> = {};

    for (const order of orders) {
      const country = order.address?.country || "Unknown";
      countryRevenue[country] =
        (countryRevenue[country] || 0) + toLKR(salesAmount(order), order.currency, lkrPerUsd);
    }

    const result = Object.keys(countryRevenue)
      .map((country) => ({ country, revenue: round2(countryRevenue[country]) }))
      .sort((a, b) => b.revenue - a.revenue);

    return res.json({ success: true, currency: "LKR", data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Country Analytics Error" });
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
    const now = new Date();
    const thisStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const growth = (current: number, previous: number) => {
      if (previous > 0) return round2(((current - previous) / previous) * 100);
      return current > 0 ? 100 : 0;
    };

    const [thisRevenue, prevRevenue] = await Promise.all([
      getRevenueSummaryLKR({ from: thisStart, to: now }),
      getRevenueSummaryLKR({ from: prevStart, to: new Date(thisStart.getTime() - 1) }),
    ]);

    const [ordersThis, ordersPrev, customersThis, customersPrev, deliveredThis, deliveredPrev] =
      await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: thisStart } } }),
        prisma.order.count({ where: { createdAt: { gte: prevStart, lt: thisStart } } }),
        prisma.user.count({ where: { role: "CUSTOMER" as any, createdAt: { gte: thisStart } } }),
        prisma.user.count({ where: { role: "CUSTOMER" as any, createdAt: { gte: prevStart, lt: thisStart } } }),
        prisma.order.count({ where: { status: "DELIVERED" as any, updatedAt: { gte: thisStart } } }),
        prisma.order.count({ where: { status: "DELIVERED" as any, updatedAt: { gte: prevStart, lt: thisStart } } }),
      ]);

    return res.json({
      success: true,
      data: {
        revenueGrowth: growth(thisRevenue.received, prevRevenue.received),
        orderGrowth: growth(ordersThis, ordersPrev),
        customerGrowth: growth(customersThis, customersPrev),
        deliveredGrowth: growth(deliveredThis, deliveredPrev),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};