import { addToQueue } from "../offline/queue";

export const placeOrder = async (orderData: any) => {
  if (!navigator.onLine) {
    await addToQueue({
      type: "ORDER",
      payload: orderData,
    });

    alert("📦 Offline mode: Order saved locally!");
    return;
  }

  await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });
};