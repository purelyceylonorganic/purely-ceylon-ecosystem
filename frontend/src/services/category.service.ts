import api from "../api/axios";

export const categoryService = {
  async getAllCategories() {
    const response = await api.get("/categories");
    return response.data;
  },
};