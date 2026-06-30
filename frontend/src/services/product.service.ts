import api from "../api/axios";

export const productService = {
  // ✅ அனைத்து Products-ஐ பெறுதல்
  async getAllProducts() {
    const response = await api.get("/products");
    return response.data;
  },

  // ✅ ஒரு Product மட்டும் பெறுதல்
async getProductById(id: string) {
  const response = await api.get(`/products/${id}`);
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