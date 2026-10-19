import api from "../api/axios";

export const IncomeSource = {
  MANUAL: "MANUAL",
  EXPORT: "EXPORT",
  OTHER: "OTHER",
} as const;

export type IncomeSource = (typeof IncomeSource)[keyof typeof IncomeSource];

export interface Income {
  id: string;
  source: IncomeSource;
  description: string;
  amount: number;
  currency: string;
  incomeDate: string;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncomePayload {
  source?: IncomeSource;
  description: string;
  amount: number;
  currency?: "LKR" | "USD";
  incomeDate?: string;
  reference?: string | null;
  notes?: string | null;
}

export const incomeService = {
  // GET /api/v1/income
  async getAll(): Promise<Income[]> {
    const response = await api.get("/income");
    return response.data.data || [];
  },

  // POST /api/v1/income
  async create(payload: IncomePayload): Promise<Income> {
    const response = await api.post("/income", payload);
    return response.data.data;
  },

  // PUT /api/v1/income/:id
  async update(id: string, payload: Partial<IncomePayload>): Promise<Income> {
    const response = await api.put(`/income/${id}`, payload);
    return response.data.data;
  },

  // DELETE /api/v1/income/:id
  async remove(id: string): Promise<void> {
    await api.delete(`/income/${id}`);
  },
};