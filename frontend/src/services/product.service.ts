import api from "../api/axios";

export const productService = {
  // ✅ அனைத்து Products-ஐ பெறுதல்
  async getAllProducts() {
    const response = await api.get("/products");
    return response.data;
  },

  // ✅ Product Search
  async searchProducts(
    name: string,
    categoryId?: string,
    minPrice?: number
  ) {
    const response = await api.get("/products/search", {
      params: {
        name,
        categoryId,
        minPrice,
      },
    });

    return response.data;
  },
};