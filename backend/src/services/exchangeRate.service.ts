import { prisma } from "../config/prisma";

// 💱 LKR per 1 USD (CurrencyRate அட்டவணையிலிருந்து)
export async function loadLkrPerUsd(): Promise<number> {
  const rateRow = await prisma.currencyRate.findUnique({ where: { code: "LKR" } });
  const lkrPerUsd = Number(rateRow?.rate);

  if (!Number.isFinite(lkrPerUsd) || lkrPerUsd <= 0) {
    throw new Error("LKR exchange rate is missing. Please update the CurrencyRate table.");
  }
  if (lkrPerUsd < 100) {
    console.warn(`⚠️ CurrencyRate LKR = ${lkrPerUsd} — இது தவறாக இருக்கலாம் (சுமார் 300 இருக்க வேண்டும்)`);
  }
  return lkrPerUsd;
}