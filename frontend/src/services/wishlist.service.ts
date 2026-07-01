import api from "../api/axios";

export const wishlistService = {
  // ❤️ Get Wishlist
  async getWishlist() {
    const response = await api.get("/wishlist");
    return response.data;
  },

  // ❤️ Add Item
  async addToWishlist(productVariantId: string) {
    const response = await api.post("/wishlist/add", {
      productVariantId,
    });

    return response.data;
  },

  // ❤️ Remove Item
  async removeWishlist(id: string) {
    const response = await api.delete(`/wishlist/${id}`);
    return response.data;
  },
};