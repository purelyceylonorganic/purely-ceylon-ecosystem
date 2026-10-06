import api from "../api/axios";

const API = "/customers";

export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province?: string | null;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
}

export interface AddressData {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export const customerService = {
  // ==========================================
  // CUSTOMER SEARCH
  // ==========================================

  async search(phone: string) {
    const response = await api.get(`${API}/search`, {
      params: { phone },
    });

    return response.data.data;
  },


  // ==========================================
// QUICK CREATE CUSTOMER
// POST /api/v1/customers/quick-create
// ==========================================

async quickCreate(data: {
  fullName: string;
  phone: string;
  email?: string;
}) {
  const response = await api.post(
    `${API}/quick-create`,
    data
  );

  return response.data;
},

  // ==========================================
  // CUSTOMER DASHBOARD STATS
  // GET /api/v1/customers/dashboard/stats
  // ==========================================

  async getDashboardStats() {
    const response = await api.get(
      `${API}/dashboard/stats`
    );

    return response.data.data;
  },
  
  // ==========================================
  // CUSTOMER LIST
  // ==========================================

  async getCustomers(
    search = "",
    status = "ALL"
  ) {
    const response = await api.get(API, {
      params: {
        search,
        status,
      },
    });

    return response.data;
  },

  // ==========================================
  // CUSTOMER PROFILE
  // ==========================================

  async getCustomerProfile(id: string) {
    const response = await api.get(
      `${API}/${id}`
    );

    return response.data.data;
  },

  // ==========================================
  // CUSTOMER NOTES
  // ==========================================

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

  async createCustomerNote(
    customerId: string,
    note: string
  ) {
    const response = await api.post(
      `${API}/${customerId}/notes`,
      { note }
    );

    return response.data;
  },

  // ==========================================
  // ADDRESS - ADD
  // ==========================================

  async addAddress(
    customerId: string,
    data: AddressData
  ) {
    const response = await api.post(
      `${API}/${customerId}/address`,
      data
    );

    return response.data.data;
  },

    // ==========================================
  // ADDRESS MANAGEMENT
  // ==========================================

  async updateAddress(
    customerId: string,
    addressId: string,
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
    const response = await api.put(
      `${API}/${customerId}/address/${addressId}`,
      data
    );

    return response.data.data;
  },

  async setDefaultAddress(
    customerId: string,
    addressId: string
  ) {
    const response = await api.patch(
      `${API}/${customerId}/address/${addressId}/default`
    );

    return response.data.data;
  },

  async deleteAddress(
    customerId: string,
    addressId: string
  ) {
    const response = await api.delete(
      `${API}/${customerId}/address/${addressId}`
    );

    return response.data;
  },

  // ==========================================
  // CUSTOMER NOTES
  // ==========================================

  async updateCustomerNote(
    customerId: string,
    noteId: string,
    note: string
  ) {
    const response = await api.put(
      `${API}/${customerId}/notes/${noteId}`,
      {
        note,
      }
    );

    return response.data.data;
  },

  async deleteCustomerNote(
    customerId: string,
    noteId: string
  ) {
    const response = await api.delete(
      `${API}/${customerId}/notes/${noteId}`
    );

    return response.data;
  },
};