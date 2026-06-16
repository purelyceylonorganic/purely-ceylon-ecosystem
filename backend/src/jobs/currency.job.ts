import cron from "node-cron";
import { updateCurrencyRates } from "../services/currency.service";

export const startCurrencyJob = () => {
  try {
    cron.schedule("0 */6 * * *", async () => {
      await updateCurrencyRates();
    });
  } catch (err) {
    console.log("Cron failed but server running");
  }
};