import api from "../api/axios";

export const invoiceService = {

  async getInvoice(orderId: string) {
    const res = await api.get(`/orders/${orderId}/details`);
    return res.data.data;
  }

};