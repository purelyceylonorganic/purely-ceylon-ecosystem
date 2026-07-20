import api from "../api/axios";


// =========================
// Order Types
// =========================

export interface OrderAddress {
  fullName: string;
  phone?: string;
  street: string;
  city: string;
  province?: string;
  postalCode?: string;
  country: string;
}

export interface ProductVariant {
  sku?: string;
  weight?: string;
}

export interface Product {
  id?: string;
  name?: string;
}

export interface OrderItem {
  product?: Product;
  productVariant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  _id?: string;

  createdAt?: string;

  status: string;

  paymentStatus?: string;

  total?: number;

  totalFinal?: number;

  address?: OrderAddress;

  items: OrderItem[];
}

export interface PlaceOrderRequest {
  addressId: string;
  paymentMethod: string;
  notes?: string;
}


export const orderService = {
  // ✅ Place Order
  async placeOrder(data: PlaceOrderRequest) {
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
   
   // ✅ Admin - Get All Orders
async getAllOrders() {
  const response = await api.get("/orders/admin/all");
  return response.data;
},

// ✅ Admin - Update Order Status
async updateOrderStatus(id: string, status: string) {
  const response = await api.put(`/orders/${id}/status`, {
    status,
  });

  return response.data;
},

async updateShipping(
  id: string,
  data: {
    shippingStatus: string;
    trackingId: string;
  }
) {
  const response = await api.put(
    `/orders/${id}/shipping`,
    data
  );

  return response.data;
},

async getDashboardStats() {
  const response =
    await api.get(
      "/orders/admin/dashboard"
    );

  return response.data;
},

};