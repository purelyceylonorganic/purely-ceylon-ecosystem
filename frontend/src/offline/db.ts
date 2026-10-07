import { openDB } from "idb";

export const dbPromise = openDB("pco-offline-db", 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("queue")) {
      db.createObjectStore("queue", {
        keyPath: "id",
      });
    }
  },
});