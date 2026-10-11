import api from "../api/axios";
import type { Category } from "../types/category";

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get("/categories");
    return response.data.data;
  },
  
  async createCategory(input: {
  name: string;
  slug: string;
}): Promise<Category> {
  const response = await api.post("/categories", input);
  return response.data.data;
},
  }