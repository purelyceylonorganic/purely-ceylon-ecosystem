import { startCurrencyJob } from "./currency.job";
import { startEmailJob } from "./email.job";
import { startRFQJob } from "./rfq.job";
import { startShipmentJob } from "./shipment.job";
import { startCleanupJob } from "./cleanup.job";
import { startBackupJob } from "./backup.job";
import { logger } from "../config/logger";

export const startAllJobs = () => {
  try {
    startCurrencyJob();
    startEmailJob();
    startRFQJob();
    startShipmentJob();
    startCleanupJob();
    startBackupJob();

    logger.info("✅ All Background Jobs Started Successfully");
  } catch (error) {
    logger.error("💥 Failed to start background jobs:", error);
  }
};