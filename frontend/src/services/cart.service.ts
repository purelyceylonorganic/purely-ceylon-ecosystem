import api from "../api/axios";

export const cartService = {
  // =========================
  // 🛒 ADD TO CART
  // =========================
  async addToCart(productVariantId: string, quantity: number) {
    const response = await api.post("/cart/add", {
      productVariantId,
      quantity,
    });

    return response.data;
  },

  // =========================
  // 👀 GET CART
  // =========================
  async getCart() {
    const response = await api.get("/cart");
    return response.data;
  },

  // =========================
  // ❌ REMOVE ITEM
  // =========================
  async removeItem(itemId: string) {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  // =========================
  // 🔄 UPDATE QUANTITY
  // =========================
  async updateQuantity(itemId: string, quantity: number) {
    const response = await api.put(`/cart/update/${itemId}`, {
      quantity,
    });

    return response.data;
  },

  // ✅ Cart Count
async getCartCount() {
  const response = await api.get("/cart");
  return response.data.items?.length ?? 0;
},
};