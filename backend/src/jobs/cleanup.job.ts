import cron from "node-cron";
import { logger } from "../config/logger";

export const startCleanupJob = () => {
  cron.schedule("0 3 * * *", async () => {
    try {
      logger.info("🧹 Cleaning Temporary Files");
      // Job logic goes here
    } catch (error) {
      logger.error("💥 Error in Cleanup Job:", error);
    }
  });
};