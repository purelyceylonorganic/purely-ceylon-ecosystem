import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
  getLkrPerUsd,
  getRevenueSummaryLKR,
  receivedAmount,
  round2,
  toLKR,
} from "../services/financeCalc.service";

// =====================================================
// 💰 FINANCE — எல்லாத் தொகைகளும் LKR-ல்
//
// Revenue  = கைக்கு வந்த பணம் (PAID / PARTIAL orders) + Income (Add Revenue)
// Expenses = Expense table (USD செலவு இருந்தால் LKR-க்கு மாற்றப்படும்)
// =====================================================

function parseDate(value: unknown): Date | undefined | "invalid" {
  if (!value) return undefined;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? "invalid" : d;
}

// =====================================================
// BUSINESS FINANCE ANALYTICS
// =====================================================
export const getFinanceAnalytics = async (req: Request, res: Response) => {
  try {
    const start = parseDate(req.query.startDate);
    const end = parseDate(req.query.endDate);

    if (start === "invalid") {
      return res.status(400).json({ success: false, message: "Invalid startDate" });
    }
    if (end === "invalid") {
      return res.status(400).json({ success: false, message: "Invalid endDate" });
    }
    if (end) end.setHours(23, 59, 59, 999);

    const summary = await getRevenueSummaryLKR({ from: start, to: end });
    const lkrPerUsd = summary.lkrPerUsd;

    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          ...(start && { gte: start }),
          ...(end && { lte: end }),
        },
      },
      select: { category: true, amount: true, currency: true },
    });

    let totalExpenses = 0;
    const expenseByCategory: Record<string, number> = {};

    for (const expense of expenses) {
      const amount = toLKR(expense.amount, expense.currency, lkrPerUsd);
      totalExpenses += amount;
      expenseByCategory[expense.category] =
        (expenseByCategory[expense.category] || 0) + amount;
    }

    for (const key of Object.keys(expenseByCategory)) {
      expenseByCategory[key] = round2(expenseByCategory[key]);
    }
    totalExpenses = round2(totalExpenses);

    const revenue = summary.received;
    const productCost = expenseByCategory.PRODUCT_COST || 0;
    const grossProfit = round2(revenue - productCost);
    const netProfit = round2(revenue - totalExpenses);

    return res.status(200).json({
      success: true,
      data: {
        revenue,

        // 🆕 கூடுதல் விவரங்கள்
        orderRevenue: summary.orderRevenue,
        otherIncome: summary.otherIncome,
        pendingRevenue: summary.pending,
        sales: summary.sales,

        expenses: {
          total: totalExpenses,
          byCategory: expenseByCategory,
        },

        productCost,
        grossProfit,
        netProfit,
        grossProfitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
        netProfitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,

        currency: "LKR",
      },
    });
  } catch (error) {
    console.error("Finance Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error calculating finance analytics",
    });
  }
};

// =====================================================
// MONTHLY FINANCE ANALYTICS
// =====================================================
export const getMonthlyFinanceAnalytics = async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ success: false, message: "Invalid year" });
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const lkrPerUsd = await getLkrPerUsd();

    const [orders, incomes, expenses] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startDate, lt: endDate } },
        select: {
          totalFinal: true,
          paidAmount: true,
          paymentStatus: true,
          status: true,
          currency: true,
          createdAt: true,
        },
      }),
      prisma.income.findMany({
        where: { incomeDate: { gte: startDate, lt: endDate } },
        select: { amount: true, currency: true, incomeDate: true },
      }),
      prisma.expense.findMany({
        where: { expenseDate: { gte: startDate, lt: endDate } },
        select: { category: true, amount: true, currency: true, expenseDate: true },
      }),
    ]);

    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: `${year}-${String(index + 1).padStart(2, "0")}`,
      revenue: 0,
      productCost: 0,
      operatingExpenses: 0,
      expenses: 0,
      grossProfit: 0,
      netProfit: 0,
    }));

    for (const order of orders) {
      monthlyData[order.createdAt.getMonth()].revenue += toLKR(
        receivedAmount(order),
        order.currency,
        lkrPerUsd
      );
    }

    for (const income of incomes) {
      monthlyData[income.incomeDate.getMonth()].revenue += toLKR(
        income.amount,
        income.currency,
        lkrPerUsd
      );
    }

    for (const expense of expenses) {
      const month = expense.expenseDate.getMonth();
      const amount = toLKR(expense.amount, expense.currency, lkrPerUsd);

      monthlyData[month].expenses += amount;

      if (expense.category === "PRODUCT_COST") {
        monthlyData[month].productCost += amount;
      } else {
        monthlyData[month].operatingExpenses += amount;
      }
    }

    for (const m of monthlyData) {
      m.revenue = round2(m.revenue);
      m.productCost = round2(m.productCost);
      m.operatingExpenses = round2(m.operatingExpenses);
      m.expenses = round2(m.expenses);
      m.grossProfit = round2(m.revenue - m.productCost);
      m.netProfit = round2(m.grossProfit - m.operatingExpenses);
    }

    const totals = monthlyData.reduce(
      (acc, m) => {
        acc.revenue += m.revenue;
        acc.productCost += m.productCost;
        acc.operatingExpenses += m.operatingExpenses;
        acc.expenses += m.expenses;
        acc.grossProfit += m.grossProfit;
        acc.netProfit += m.netProfit;
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

    return res.status(200).json({
      success: true,
      year,
      data: monthlyData,
      totals: {
        revenue: round2(totals.revenue),
        productCost: round2(totals.productCost),
        operatingExpenses: round2(totals.operatingExpenses),
        expenses: round2(totals.expenses),
        grossProfit: round2(totals.grossProfit),
        netProfit: round2(totals.netProfit),
      },
      currency: "LKR",
    });
  } catch (error) {
    console.error("Monthly Finance Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error calculating monthly finance analytics",
    });
  }
};