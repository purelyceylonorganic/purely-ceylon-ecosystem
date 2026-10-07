import api from "../api/axios";
import {
  getQueue,
  clearItem,
  updateQueueItem,
} from "./queue";
import { shouldRetry } from "./retry";

let isSyncing = false;

export const syncOfflineQueue = async () => {
  if (isSyncing) {
    return;
  }

  if (!navigator.onLine) {
    return;
  }

  isSyncing = true;

  try {
    const queue = await getQueue();

    for (const item of queue) {
      if (item.status === "failed") {
        continue;
      }

      try {
        await updateQueueItem(item.id, {
          status: "syncing",
        });

        /*
         * Payment requests must never
         * be processed from the offline queue.
         */
        if (item.type === "payment") {
          console.warn(
            "Payment request found in offline queue. Skipping:",
            item.id
          );

          await updateQueueItem(item.id, {
            status: "failed",
          });

          continue;
        }

        /*
         * Customer order endpoint
         * confirmed from orderService:
         * POST /orders/checkout
         */
        await api.post(
          "/orders/checkout",
          item.payload
        );

        await clearItem(item.id);

        console.log(
          "✅ Offline order synced:",
          item.id
        );
      } catch (error: any) {
        console.error(
          "Offline sync failed:",
          item.id,
          error
        );

        const nextRetries =
          item.retries + 1;

        if (shouldRetry(nextRetries)) {
          await updateQueueItem(item.id, {
            retries: nextRetries,
            status: "pending",
          });

          console.log(
            `🔁 Retry ${nextRetries}/3:`,
            item.id
          );
        } else {
          await updateQueueItem(item.id, {
            retries: nextRetries,
            status: "failed",
          });

          console.error(
            "❌ Offline order failed permanently:",
            item.id
          );
        }
      }
    }
  } finally {
    isSyncing = false;
  }
};