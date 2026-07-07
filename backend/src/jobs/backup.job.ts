import cron from "node-cron";
import { logger } from "../config/logger";

export const startBackupJob = () => {
  cron.schedule("0 2 * * *", async () => {
    try {
      logger.info("💾 Database Backup Started");
      // Job logic goes here
    } catch (error) {
      logger.error("💥 Error in Backup Job:", error);
    }
  });
};