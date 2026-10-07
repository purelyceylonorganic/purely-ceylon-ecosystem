import { syncOfflineQueue } from "./syncEngine";

let cleanupNetworkListener: (() => void) | null = null;

export const startNetworkListener = () => {
  if (cleanupNetworkListener) {
    return cleanupNetworkListener;
  }

  const handleOnline = () => {
    console.log("🌐 Network online. Syncing offline queue...");
    syncOfflineQueue();
  };

  window.addEventListener("online", handleOnline);

  const intervalId = window.setInterval(() => {
    if (navigator.onLine) {
      syncOfflineQueue();
    }
  }, 30000);

  cleanupNetworkListener = () => {
    window.removeEventListener("online", handleOnline);
    window.clearInterval(intervalId);
    cleanupNetworkListener = null;
  };

  return cleanupNetworkListener;
};