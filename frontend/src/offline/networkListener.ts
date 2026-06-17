import { syncOfflineQueue } from "./syncEngine";

export const startNetworkListener = () => {
  window.addEventListener("online", () => {
    syncOfflineQueue();
  });

  // periodic sync every 30 seconds
  setInterval(() => {
    if (navigator.onLine) {
      syncOfflineQueue();
    }
  }, 30000);
};