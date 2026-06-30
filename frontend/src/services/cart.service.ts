import api from "../api/axios";

export const cartService = {
  // ✅ Add To Cart
  async addToCart(productVariantId: string, quantity: number) {
    const response = await api.post("/cart/add", {
      productVariantId,
      quantity,
    });

    return response.data;
  },

  // ✅ Get Cart
  async getCart() {
    const response = await api.get("/cart");
    return response.data;
  },

  // ✅ Remove Item
  async removeItem(itemId: string) {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  // ✅ Update Quantity
  async updateQuantity(itemId: string, quantity: number) {
    const response = await api.put(`/cart/update/${itemId}`, {
      quantity,
    });

    return response.data;
  },
};