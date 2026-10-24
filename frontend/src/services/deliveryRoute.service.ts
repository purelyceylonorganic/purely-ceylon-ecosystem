import api from "../api/axios";

export interface DeliveryRoute {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  customerCount: number;
}

export interface DeliveryRoutePayload {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export const deliveryRouteService = {
  // GET /api/v1/delivery-routes
  async getAll(): Promise<DeliveryRoute[]> {
    const response = await api.get("/delivery-routes");
    return response.data.data || [];
  },

  // POST /api/v1/delivery-routes
  async create(payload: DeliveryRoutePayload) {
    const response = await api.post("/delivery-routes", payload);
    return response.data;
  },

  // PUT /api/v1/delivery-routes/:id
  async update(id: string, payload: Partial<DeliveryRoutePayload>) {
    const response = await api.put(`/delivery-routes/${id}`, payload);
    return response.data;
  },

  // DELETE /api/v1/delivery-routes/:id
  async remove(id: string) {
    const response = await api.delete(`/delivery-routes/${id}`);
    return response.data;
  },
};