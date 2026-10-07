import { dbPromise } from "./db";

export interface OfflineQueueItem {
  id: string;
  type: string;
  payload: unknown;
  retries: number;
  status: "pending" | "syncing" | "failed";
  createdAt: number;
  updatedAt: number;
}

export const addToQueue = async (
  data: Omit<
    OfflineQueueItem,
    "id" | "retries" | "status" | "createdAt" | "updatedAt"
  >
) => {
  const db = await dbPromise;

  const now = Date.now();

  const item: OfflineQueueItem = {
    ...data,
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    retries: 0,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await db.put("queue", item);

  return item;
};

export const getQueue = async (): Promise<OfflineQueueItem[]> => {
  const db = await dbPromise;

  return await db.getAll("queue");
};

export const updateQueueItem = async (
  id: string,
  updates: Partial<OfflineQueueItem>
) => {
  const db = await dbPromise;

  const existing = await db.get("queue", id);

  if (!existing) {
    return;
  }

  await db.put("queue", {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  });
};

export const clearItem = async (id: string) => {
  const db = await dbPromise;

  await db.delete("queue", id);
};

export const clearQueue = async () => {
  const db = await dbPromise;

  await db.clear("queue");
};