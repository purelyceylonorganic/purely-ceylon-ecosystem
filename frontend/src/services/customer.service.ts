import api from "../api/axios";

const API = "/customers";

export const customerService = {


  async search(phone: string) {
    const response = await api.get(
      `${API}/search`,
      {
        params: { phone },
      }
    );

    return response.data.data;
  },

  async getCustomers(
    search = "",
    status = "ALL"
  ) {
    const response = await api.get(
      API,
      {
        params: {
          search,
          status,
        },
      }
    );

    return response.data;
  },

  async getCustomerProfile(id: string) {
    const response = await api.get(
      `${API}/${id}`
    );

    return response.data.data;
  },

  async getNotes(customerId: string) {
    const response = await api.get(
      `${API}/${customerId}/notes`
    );

    return response.data.data;
  },

  async addNote(
    customerId: string,
    note: string
  ) {
    const response = await api.post(
      `${API}/${customerId}/notes`,
      { note }
    );

    return response.data.data;
  },

  async addAddress(
    customerId: string,
    data: {
      fullName: string;
      phone: string;
      street: string;
      city: string;
      province?: string;
      postalCode?: string;
      country?: string;
      isDefault?: boolean;
    }
  ) {
    const response = await api.post(
      `${API}/${customerId}/address`,
      data
    );

    return response.data.data;
  },

};