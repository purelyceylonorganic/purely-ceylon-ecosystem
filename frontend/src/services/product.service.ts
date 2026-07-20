import api from "../api/axios";
import type { Product, ProductResponse } from "../types/product.types"; // ProductResponse இம்போர்ட் செய்யவும்

export const productService = {
  // Get All Products
  async getProducts(params: {
    page?: number;
    limit?: number;
  }): Promise<ProductResponse> {
    const response = await api.get("/products", {
      params,
    });

    return {
      products: response.data.data,
      pagination: response.data.pagination,
    };
  },
   
  // Public Products (Customer)
async getPublicProducts(params: {
  page?: number;
  limit?: number;
}): Promise<ProductResponse> {

  const response = await api.get(
    "/products/public",
    {
      params,
    }
  );

  return {
    products: response.data.data,
    pagination: response.data.pagination,
  };
},

  // Get Single Product
  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  // Search Products
  async searchProducts(params: {
    name?: string;
    categoryId?: string;
  }): Promise<Product[]> {
    const response = await api.get("/products/search", {
      params,
    });

    return response.data.data;
  },

  // Create Product
  async createProduct(data: any) {
    const response = await api.post("/products", data);
    return response.data;
  },

  // Update Product
  async updateProduct(id: string, data: any) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete Product
  async deleteProduct(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  async bulkStatusUpdate(data: {
  ids: string[];
  status: string;
}) {

  const response =
    await api.put(
      "/products/bulk-status",
      data
    );

  return response.data;

},

async restoreProduct(id: string) {

  const response =
    await api.put(
      `/products/restore/${id}`
    );

  return response.data;

},
};