import api from "../api/axios";

// ✅ fullName மற்றும் phone இங்கும் சேர்க்கப்பட்டுள்ளது
export interface Address {
  id: string;
  fullName: string; 
  phone: string;     
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
    fullName: string;  // 👈 புதிய ஃபீல்டு
    phone: string;     // 👈 புதிய ஃபீல்டு
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
      fullName: string;  // 👈 புதிய ஃபீல்டு
      phone: string;     // 👈 புதிய ஃபீல்டு
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

  // ✅ நீங்கள் கேட்ட புதியsetDefaultAddress மெத்தட் இணைக்கப்பட்டுள்ளது
  async setDefaultAddress(id: string) {
    const response = await api.patch(`/address/default/${id}`);
    return response.data;
  },
};