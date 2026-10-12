
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getRevenueInUSD() {
  const orders = await prisma.order.findMany({
    select: {
      totalFinal: true,
      exchangeRate: true,
      currency: true,
    },
  });

  return orders.reduce((sum, order) => {
    const total = Number(order.totalFinal || 0);
    const rate = Number(order.exchangeRate || 0);

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      return sum;
    }

    // Exchange rate convention: currency units per USD.
    return sum + total / rate;
  }, 0);
}
