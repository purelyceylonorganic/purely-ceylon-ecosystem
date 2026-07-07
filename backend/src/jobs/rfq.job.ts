import cron from "node-cron";
import { logger } from "../config/logger";

export const startRFQJob = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      logger.info("📄 Checking Expired RFQs");
      // Job logic goes here
    } catch (error) {
      logger.error("💥 Error in RFQ Job:", error);
    }
  });
};