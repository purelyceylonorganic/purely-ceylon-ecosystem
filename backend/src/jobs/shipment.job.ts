import cron from "node-cron";
import { logger } from "../config/logger";

export const startShipmentJob = () => {
  cron.schedule("0 */6 * * *", async () => {
    try {
      logger.info("🚢 Shipment ETA Reminder");
      // Job logic goes here
    } catch (error) {
      logger.error("💥 Error in Shipment Job:", error);
    }
  });
};