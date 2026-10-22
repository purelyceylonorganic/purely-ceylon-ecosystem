
import api from "../api/axios";

export interface DeliveryRoute {
  id: string;
  name: string;
  isActive: boolean;
  customerCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryRouteInput {
  name: string;
  isActive?: boolean;
}

const API = "/delivery-routes";

export const deliveryRouteService = {
  async getAll(): Promise<DeliveryRoute[]> {
    const response = await api.get(API);
    return response.data.data;
  },

  async create(data: DeliveryRouteInput) {
    const response = await api.post(API, data);
    return response.data;
  },

  async update(id: string, data: Partial<DeliveryRouteInput>) {
    const response = await api.put(`${API}/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`${API}/${id}`);
    return response.data;
  },
};
