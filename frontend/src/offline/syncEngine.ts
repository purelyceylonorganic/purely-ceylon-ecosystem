import axios from "axios";
import { getQueue, clearItem } from "./queue";
import { shouldRetry } from "./retry";

export const syncOfflineQueue = async () => {
  const queue = await getQueue();

  for (const item of queue) {
    try {
      // Try sending offline saved request
      await axios.post("/api/orders", item.payload);

      // If success → remove from queue
      await clearItem(item.id);
      console.log("✅ Synced:", item.id);

    } catch (error) {
      // Increase retry count
      item.retries += 1;

      // Retry logic check (centralized)
      if (!shouldRetry(item.retries)) {
        console.log("❌ Failed permanently:", item.id);

        // Remove if exceeded retry limit
        await clearItem(item.id);
      }
    }
  }
};