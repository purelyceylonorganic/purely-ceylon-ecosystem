import api from "../api/axios";

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  inventory?: any[];
}

export const warehouseService = {
  // Get all warehouses
  async getAll(): Promise<Warehouse[]> {
    const response = await api.get("/warehouse");

    return response.data.data || [];
  },

  // Get single warehouse
  async getById(id: string) {
    const response = await api.get(`/warehouse/${id}`);

    return response.data.data;
  },

  // Create warehouse
  async create(data: {
    name: string;
    location: string;
  }) {
    const response = await api.post("/warehouse", data);

    return response.data.data;
  },

  // Update warehouse
  async update(
    id: string,
    data: {
      name: string;
      location: string;
    }
  ) {
    const response = await api.put(`/warehouse/${id}`, data);

    return response.data.data;
  },

  // Delete warehouse
  async delete(id: string) {
    const response = await api.delete(`/warehouse/${id}`);

    return response.data;
  },
};