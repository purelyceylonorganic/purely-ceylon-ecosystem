import { dbPromise } from "./db";

export const addToQueue = async (data: any) => {
  const db = await dbPromise;
  await db.put("queue", {
    ...data,
    id: Date.now(),
    retries: 0,
    status: "pending",
  });
};

export const getQueue = async () => {
  const db = await dbPromise;
  return await db.getAll("queue");
};

export const clearItem = async (id: number) => {
  const db = await dbPromise;
  await db.delete("queue", id);
};