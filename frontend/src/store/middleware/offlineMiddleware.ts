import { addToQueue } from "../../offline/queue";

export const offlineMiddleware =
  () => (next: any) => async (action: any) => {
    const result = next(action);

    if (action.type === "ORDER/CREATE") {
      if (!navigator.onLine) {
        await addToQueue({
          type: action.type,
          payload: action.payload,
        });

        console.log("📦 Stored offline via middleware");
      }
    }

    return result;
  };