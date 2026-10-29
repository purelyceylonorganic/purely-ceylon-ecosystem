import axios from "axios";
import { prisma } from "../config/prisma"; // உங்கள் shared prisma path-ஐ இங்கே மாற்றுங்கள்
import { logger } from "../config/logger";

const RATE_URL = "https://open.er-api.com/v6/latest/USD";

// தேவையான நாணயங்கள் மட்டும் (1 USD = எத்தனை LKR)
const WANTED_CODES = ["LKR"];

// நியாயமான வரம்பு: தவறான API தரவைத் தடுக்க
const SANE_RANGE: Record<string, { min: number; max: number }> = {
  LKR: { min: 100, max: 1000 },
};

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export const updateCurrencyRates = async (): Promise<void> => {
  let rates: Record<string, number> | undefined;

  try {
    const response = await axios.get(RATE_URL, { timeout: 10000 });
    rates = response.data?.rates;
  } catch (error) {
    logger.error(`Currency API request failed: ${errMsg(error)}`);
    return; // பழைய rate DB-ல் அப்படியே இருக்கும்
  }

  if (!rates || typeof rates !== "object") {
    logger.error("Currency API: rates data இல்லை");
    return;
  }

  for (const code of WANTED_CODES) {
    const rate = rates[code];
    const range = SANE_RANGE[code];

    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      logger.error(`Currency API: ${code} rate கிடைக்கவில்லை`);
      continue;
    }

    if (range && (rate < range.min || rate > range.max)) {
      logger.error(`Currency API: ${code} மதிப்பு சந்தேகமானது (${rate}). புறக்கணிக்கப்பட்டது.`);
      continue;
    }

    try {
      await prisma.currencyRate.upsert({
        where: { code },
        update: { rate },
        create: { code, rate },
      });
      logger.info(`💱 ${code} rate updated: 1 USD = ${rate} ${code}`);
    } catch (error) {
      logger.error(`Currency DB save failed (${code}): ${errMsg(error)}`);
    }
  }
};