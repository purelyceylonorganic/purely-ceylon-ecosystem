import cron from "node-cron";
import { logger } from "../config/logger";

export const startEmailJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      logger.info("📧 Processing Email Queue");
      // Job logic goes here
    } catch (error) {
      logger.error("💥 Error in Email Job:", error);
    }
  });
};