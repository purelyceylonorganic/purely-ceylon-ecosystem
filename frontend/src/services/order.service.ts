import api from "../api/axios";

export const orderService = {
  // ✅ Place Order
  async placeOrder(data: any) {
    const response = await api.post("/orders/checkout", data);
    return response.data;
  },

  // ✅ My Orders
  async getMyOrders() {
    const response = await api.get("/orders/my-orders");
    return response.data;
  },

  // ✅ Single Order
  async getOrder(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // ✅ My Addresses
  async getAddresses() {
    const response = await api.get("/orders/addresses");
    return response.data;
  },

  // ✅ Add Address
  async addAddress(data: any) {
    const response = await api.post("/orders/addresses", data);
    return response.data;
  },

  // ✅ Update Address
  async updateAddress(id: string, data: any) {
    const response = await api.put(`/orders/addresses/${id}`, data);
    return response.data;
  },

  // ✅ Delete Address
  async deleteAddress(id: string) {
    const response = await api.delete(`/orders/addresses/${id}`);
    return response.data;
  },
};