import { prisma } from "../config/prisma";

// ======================================================
// 💰 FINANCE கணக்கு உதவி functions
// எல்லா அறிக்கைகளும் LKR-ல் காட்டப்படும்.
// USD தொகைகள் தற்போதைய CurrencyRate (LKR per 1 USD) மூலம் LKR-க்கு மாற்றப்படும்.
// ======================================================

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export async function getLkrPerUsd(): Promise<number> {
  const row = await prisma.currencyRate.findUnique({ where: { code: "LKR" } });
  const rate = Number(row?.rate);

  if (!Number.isFinite(rate) || rate <= 0) {
    console.warn("⚠️ CurrencyRate LKR இல்லை — finance அறிக்கைக்கு 300 பயன்படுத்தப்படுகிறது");
    return 300;
  }
  return rate;
}

export function toLKR(
  amount: number,
  currency: string | null | undefined,
  lkrPerUsd: number
): number {
  const n = Number(amount) || 0;
  return String(currency || "LKR").toUpperCase() === "USD" ? n * lkrPerUsd : n;
}

export type OrderMoney = {
  totalFinal: number;
  paidAmount: number;
  paymentStatus: string;
  status: string;
  currency: string;
};

// 💵 உண்மையாகக் கைக்கு வந்த பணம் (order currency-ல்)
export function receivedAmount(o: OrderMoney): number {
  if (o.paymentStatus === "PAID") return Number(o.totalFinal) || 0;
  if (o.paymentStatus === "PARTIAL") return Number(o.paidAmount) || 0;
  return 0;
}

// ⏳ இன்னும் வசூலிக்க வேண்டிய தொகை
export function receivableAmount(o: OrderMoney): number {
  if (o.status === "CANCELLED") return 0;
  const total = Number(o.totalFinal) || 0;
  if (o.paymentStatus === "UNPAID") return total;
  if (o.paymentStatus === "PARTIAL") return Math.max(total - (Number(o.paidAmount) || 0), 0);
  return 0;
}

// 🛒 விற்பனை மதிப்பு (ரத்து செய்யாத orders)
export function salesAmount(o: OrderMoney): number {
  return o.status === "CANCELLED" ? 0 : Number(o.totalFinal) || 0;
}

function dateFilter(from?: Date, to?: Date) {
  if (!from && !to) return undefined;
  return { ...(from && { gte: from }), ...(to && { lte: to }) };
}

// ======================================================
// 📊 Revenue சுருக்கம் (LKR)
// ======================================================
export async function getRevenueSummaryLKR(range?: { from?: Date; to?: Date }) {
  const lkrPerUsd = await getLkrPerUsd();

  const [orders, incomes] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: dateFilter(range?.from, range?.to) },
      select: {
        totalFinal: true,
        paidAmount: true,
        paymentStatus: true,
        status: true,
        currency: true,
      },
    }),
    prisma.income.findMany({
      where: { incomeDate: dateFilter(range?.from, range?.to) },
      select: { amount: true, currency: true },
    }),
  ]);

  let orderRevenue = 0;
  let sales = 0;
  let pending = 0;
  const receivedByCurrency: Record<string, number> = {};

  for (const o of orders) {
    const received = receivedAmount(o);
    orderRevenue += toLKR(received, o.currency, lkrPerUsd);
    sales += toLKR(salesAmount(o), o.currency, lkrPerUsd);
    pending += toLKR(receivableAmount(o), o.currency, lkrPerUsd);
    receivedByCurrency[o.currency] = (receivedByCurrency[o.currency] || 0) + received;
  }

  const otherIncome = incomes.reduce(
    (sum, i) => sum + toLKR(i.amount, i.currency, lkrPerUsd),
    0
  );

  return {
    lkrPerUsd,
    orderRevenue: round2(orderRevenue),
    otherIncome: round2(otherIncome),
    received: round2(orderRevenue + otherIncome),
    sales: round2(sales),
    pending: round2(pending),
    receivedByCurrency,
  };
}