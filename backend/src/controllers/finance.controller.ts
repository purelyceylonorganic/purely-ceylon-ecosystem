import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =====================================================
// BUSINESS FINANCE ANALYTICS
// =====================================================

export const getFinanceAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const { startDate, endDate } = req.query;

    const whereOrder: any = {
      status: {
        not: "CANCELLED",
      },
    };

    const whereExpense: any = {};

    // =================================================
    // DATE FILTER
    // =================================================

    if (startDate || endDate) {
      const start = startDate
        ? new Date(String(startDate))
        : undefined;

      const end = endDate
        ? new Date(String(endDate))
        : undefined;

      if (start && isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate",
        });
      }

      if (end && isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid endDate",
        });
      }

      if (start || end) {
        whereOrder.createdAt = {};

        whereExpense.expenseDate = {};

        if (start) {
          whereOrder.createdAt.gte = start;
          whereExpense.expenseDate.gte = start;
        }

        if (end) {
          end!.setHours(23, 59, 59, 999);

          whereOrder.createdAt.lte = end;
          whereExpense.expenseDate.lte = end;
        }
      }
    }

    // =================================================
    // REVENUE
    // =================================================

    const orders = await prisma.order.findMany({
      where: whereOrder,
      select: {
        totalFinal: true,
      },
    });

    const revenue = orders.reduce(
      (total, order) =>
        total + Number(order.totalFinal || 0),
      0
    );

    // =================================================
    // EXPENSES
    // =================================================

    const expenses = await prisma.expense.findMany({
      where: whereExpense,
      select: {
        category: true,
        amount: true,
        currency: true,
      },
    });

    const totalExpenses = expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

    // =================================================
    // EXPENSE BY CATEGORY
    // =================================================

    const expenseByCategory: Record<string, number> = {};

    for (const expense of expenses) {
      const category = expense.category;

      expenseByCategory[category] =
        (expenseByCategory[category] || 0) +
        Number(expense.amount || 0);
    }

    // =================================================
    // PRODUCT COST
    // =================================================

    const productCost =
      expenseByCategory.PRODUCT_COST || 0;

    // =================================================
    // GROSS PROFIT
    // =================================================

    const grossProfit = revenue - productCost;

    // =================================================
    // NET PROFIT
    // =================================================

    const netProfit = revenue - totalExpenses;

    // =================================================
    // MARGINS
    // =================================================

    const grossProfitMargin =
      revenue > 0
        ? (grossProfit / revenue) * 100
        : 0;

    const netProfitMargin =
      revenue > 0
        ? (netProfit / revenue) * 100
        : 0;

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      data: {
        revenue,

        expenses: {
          total: totalExpenses,
          byCategory: expenseByCategory,
        },

        productCost,

        grossProfit,

        netProfit,

        grossProfitMargin,

        netProfitMargin,

        currency: "LKR",
      },
    });
  } catch (error) {
    console.error(
      "Finance Analytics Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error calculating finance analytics",
    });
  }
};

// =====================================================
// MONTHLY FINANCE ANALYTICS
// =====================================================

export const getMonthlyFinanceAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
      });
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // =================================================
    // ORDERS
    // =================================================

    const orders = await prisma.order.findMany({
      where: {
        status: {
          not: "CANCELLED",
        },
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        totalFinal: true,
        createdAt: true,
      },
    });

    // =================================================
    // EXPENSES
    // =================================================

    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        category: true,
        amount: true,
        expenseDate: true,
      },
    });

    // =================================================
    // CREATE 12 MONTHS
    // =================================================

    const monthlyData = Array.from(
      { length: 12 },
      (_, index) => ({
        month: `${year}-${String(index + 1).padStart(2, "0")}`,
        revenue: 0,
        productCost: 0,
        operatingExpenses: 0,
        expenses: 0,
        grossProfit: 0,
        netProfit: 0,
      })
    );

    // =================================================
    // MONTHLY REVENUE
    // =================================================

    for (const order of orders) {
      const month = order.createdAt.getMonth();

      monthlyData[month].revenue += Number(
        order.totalFinal || 0
      );
    }

    // =================================================
    // MONTHLY EXPENSES
    // =================================================

    for (const expense of expenses) {
      const month = expense.expenseDate.getMonth();

      const amount = Number(expense.amount || 0);

      monthlyData[month].expenses += amount;

      if (expense.category === "PRODUCT_COST") {
        monthlyData[month].productCost += amount;
      } else {
        monthlyData[month].operatingExpenses += amount;
      }
    }

    // =================================================
    // PROFIT CALCULATIONS
    // =================================================

    for (const month of monthlyData) {
      month.grossProfit =
        month.revenue - month.productCost;

      month.netProfit =
        month.grossProfit -
        month.operatingExpenses;
    }

    // =================================================
    // YEAR TOTALS
    // =================================================

    const totals = monthlyData.reduce(
      (acc, month) => {
        acc.revenue += month.revenue;
        acc.productCost += month.productCost;
        acc.operatingExpenses +=
          month.operatingExpenses;
        acc.expenses += month.expenses;
        acc.grossProfit += month.grossProfit;
        acc.netProfit += month.netProfit;

        return acc;
      },
      {
        revenue: 0,
        productCost: 0,
        operatingExpenses: 0,
        expenses: 0,
        grossProfit: 0,
        netProfit: 0,
      }
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      year,

      data: monthlyData,

      totals,

      currency: "LKR",
    });
  } catch (error) {
    console.error(
      "Monthly Finance Analytics Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error calculating monthly finance analytics",
    });
  }
};
