import api from "./api"; // உங்கள் axios instance (product.service.ts-ல் உள்ள import-ஐப் பாருங்கள்)

export interface TaxRate {
  id: string;
  country: string;
  taxName: string;
  rate: number;
  isActive: boolean;
}

export const taxService = {
  list: async (): Promise<TaxRate[]> => (await api.get("/tax")).data.taxes,
  create: async (d: Omit<TaxRate, "id">) => (await api.post("/tax", d)).data,
  update: async (id: string, d: Omit<TaxRate, "id">) => (await api.put(`/tax/${id}`, d)).data,
  toggle: async (id: string) => (await api.patch(`/tax/${id}/toggle`)).data,
  remove: async (id: string) => (await api.delete(`/tax/${id}`)).data,
};