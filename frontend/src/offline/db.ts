import { openDB } from "idb";

export const dbPromise = openDB("pco-offline-db", 1, {
  upgrade(db) {
    db.createObjectStore("queue", {
      keyPath: "id",
    });
  },
});