import api from "../api/axios";

export type ShippingCurrency = "LKR" | "USD";

export interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  carrier: string | null;
  description: string | null;
  hasTracking: boolean;
  minDays: number;
  maxDays: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  isActive: boolean;
  isFallback: boolean;
  sortOrder: number;
}

export interface ShippingBand {
  minGrams: number;
  maxGrams: number | null;
  price: number;
  extraPerKg: number | null;
}

export interface ShippingZoneMethod {
  id: string;
  zoneId: string;
  methodId: string;
  isEnabled: boolean;
  currency: ShippingCurrency;
  freeOverAmount: number | null;
  bands: ShippingBand[];
}

export interface ShippingConfig {
  zones: ShippingZone[];
  methods: ShippingMethod[];
  zoneMethods: ShippingZoneMethod[];
}

export interface ShippingOption {
  methodCode: string;
  name: string;
  carrier: string | null;
  description: string | null;
  hasTracking: boolean;
  minDays: number;
  maxDays: number;
  cost: number;
  originalCost: number;
  isFree: boolean;
  currency: ShippingCurrency;
}

export type ZonePayload = {
  name: string;
  countries: string[];
  isActive: boolean;
  isFallback: boolean;
};

export type MethodPayload = {
  code: string;
  name: string;
  carrier: string | null;
  description: string | null;
  hasTracking: boolean;
  minDays: number;
  maxDays: number;
  isActive: boolean;
  sortOrder: number;
};

export type ZoneMethodPayload = {
  zoneId: string;
  methodId: string;
  isEnabled: boolean;
  currency: ShippingCurrency;
  freeOverAmount: number | null;
  bands: ShippingBand[];
};

const BASE = "/shipping-settings";

export const shippingSettingsService = {
  async getConfig(): Promise<ShippingConfig> {
    const response = await api.get(`${BASE}/config`);
    return response.data.data;
  },

  async seed() {
    const response = await api.post(`${BASE}/seed`);
    return response.data;
  },

  async createZone(payload: ZonePayload) {
    return (await api.post(`${BASE}/zones`, payload)).data;
  },
  async updateZone(id: string, payload: Partial<ZonePayload>) {
    return (await api.put(`${BASE}/zones/${id}`, payload)).data;
  },
  async deleteZone(id: string) {
    return (await api.delete(`${BASE}/zones/${id}`)).data;
  },

  async createMethod(payload: MethodPayload) {
    return (await api.post(`${BASE}/methods`, payload)).data;
  },
  async updateMethod(id: string, payload: Partial<MethodPayload>) {
    return (await api.put(`${BASE}/methods/${id}`, payload)).data;
  },
  async deleteMethod(id: string) {
    return (await api.delete(`${BASE}/methods/${id}`)).data;
  },

  async saveZoneMethod(payload: ZoneMethodPayload) {
    return (await api.put(`${BASE}/zone-methods`, payload)).data;
  },

  async test(payload: {
    country: string;
    currency: ShippingCurrency;
    totalGrams: number;
    subtotal: number;
  }): Promise<{ zone: { id: string; name: string } | null; options: ShippingOption[] }> {
    const response = await api.post(`${BASE}/test`, payload);
    return { zone: response.data.zone, options: response.data.options };
  },

  // Checkout-க்கு (படி S2-ல் பயன்படும்)
  async getOptions(payload: {
    country: string;
    currency: ShippingCurrency;
    items: { productVariantId: string; quantity: number }[];
  }) {
    const response = await api.post(`${BASE}/options`, payload);
    return response.data as {
      zone: { id: string; name: string } | null;
      totalGrams: number;
      missingWeight: boolean;
      options: ShippingOption[];
    };
  },
};