import api from "../api/axios";

export const paymentService = {
  async createPayment(data: {
    orderId: string;
    amount: number;
    gateway: string;
    paymentMethod: string;
  }) {
    const response = await api.post("/payments", data);
    return response.data;
  },

  async collectPayment(data: {
    orderId: string;
    amount: number;
    gateway: string;
    paymentMethod: string;
  }) {
    return this.createPayment(data);
  },

  async getPaymentHistory(orderId: string) {
    const response = await api.get(`/payments/history/${orderId}`);
    return response.data;
  },

  async getHistory(orderId: string) {
    return this.getPaymentHistory(orderId);
  },

  async getOrderPayments(orderId: string) {
    return this.getPaymentHistory(orderId);
  },

  async confirmOrder(orderId: string) {
    const res = await api.post(`/admin/orders/${orderId}/confirm`);
    return res.data;
  },
  async voidPayment(
  paymentId: string,
  reason: string
) {
  const response = await api.patch(
    `/payments/${paymentId}/void`,
    {
      reason,
    }
  );

  return response.data;
},
async refundPayment(
  paymentId: string,
  amount: number,
  reason: string
) {
  const response = await api.post(
    `/payments/${paymentId}/refund`,
    {
      amount,
      reason,
    }
  );

  return response.data;
},

reversePayment(paymentId: string, reason: string) {
  return api.post(
    `/payments/${paymentId}/reverse`,
    {
      reason
    }
  );
},


};