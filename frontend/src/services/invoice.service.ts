import api from "../api/axios";

export const invoiceService = {

  async getInvoice(orderId: string) {
    const res = await api.get(`/admin/orders/${orderId}`);
    return res.data.data;
  }

};