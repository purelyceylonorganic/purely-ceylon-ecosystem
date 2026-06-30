import api from "../api/axios";

export const addressService = {
  async getAddresses() {
  const response = await api.get("/orders/addresses");
  return response.data;
},

  async addAddress(data: any) {
    const response = await api.post("/orders/addresses", data);
    return response.data;
  },
};