import api from "../api/axios";
import type { Category } from "../types/category";

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get("/categories");

    return response.data.data;
  },
};