import cron from "node-cron";
import { updateCurrencyRates } from "../services/currency.service";
import { logger } from "../config/logger";

let running = false;

const runUpdate = async (): Promise<void> => {
  if (running) {
    logger.warn("Currency update skipped. Previous job still running");
    return;
  }

  try {
    running = true;
    logger.info("💱 Currency Update Started");
    await updateCurrencyRates();
    logger.info("✅ Currency Update Completed");
  } catch (error) {
    logger.error(
      `💥 Currency Job Failed: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    running = false;
  }
};

export const startCurrencyJob = (): void => {
  // ஒவ்வொரு 6 மணி நேரத்துக்கும் (Asia/Colombo)
  cron.schedule("0 */6 * * *", runUpdate, { timezone: "Asia/Colombo" });

  // Server தொடங்கியவுடன் உடனே ஒருமுறை இயக்கு
  void runUpdate();
};