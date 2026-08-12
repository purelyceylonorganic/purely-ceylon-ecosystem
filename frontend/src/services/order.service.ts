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
  async getOrderDetails(id: string) {
  const response = await api.get(`/orders/${id}/details`);
  return response.data.data;
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

async createDraftOrder(
    customerId: string,
    addressId: string
  ) {
    try {
      const response = await api.post(
        "/orders/admin/create",
        {
          customerId, 
          addressId,
        }
      );

      return response.data.data;
    }
    
    catch (error: any) {
      console.log("Create Draft Order Error:", error.response?.data);
      throw error;
    }
  },

  async addProduct(
  orderId: string,
  productVariantId: string,
  quantity = 1
) {

  const response =
    await api.post("/orders/admin/add-product", {

      orderId,

      productVariantId,

      quantity,

    });

  return response.data;

},

async updateOrderItemQuantity(
  orderItemId: string,
  quantity: number
) {
  const response = await api.put(
    "/orders/admin/update-quantity",
    {
      orderItemId,
      quantity,
    }
  );

  return response.data.data;
},

async removeProduct(orderItemId: string) {
  const response = await api.delete(
    "/orders/admin/remove-product",
    {
      data: {
        orderItemId,
      },
    }
  );

  return response.data.data;
},

async confirmOrder(orderId: string) {

  const response =
    await api.put(
      "/orders/admin/confirm",
      {
        orderId,
      }
    );

  return response.data.data;

},

};
