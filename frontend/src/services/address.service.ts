import api from "../api/axios";

export interface Address {
  id: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export const addressService = {
  async getMyAddresses() {
    const response = await api.get("/address");
    return response.data;
  },

  async addAddress(data: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }) {
    const response = await api.post("/address", data);
    return response.data;
  },

  async updateAddress(
    id: string,
    data: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
    }
  ) {
    const response = await api.put(`/address/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: string) {
    const response = await api.delete(`/address/${id}`);
    return response.data;
  },
};