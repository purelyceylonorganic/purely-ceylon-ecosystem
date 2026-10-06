import api from "../api/axios";

export const ExpenseCategory = {
  PRODUCT_COST: "PRODUCT_COST",
  PACKAGING: "PACKAGING",
  PETROL: "PETROL",
  SALARY: "SALARY",
  MAINTENANCE: "MAINTENANCE",
  FINANCE: "FINANCE",
  SHIPPING: "SHIPPING",
  MARKETING: "MARKETING",
  OTHER: "OTHER",
} as const;

export type ExpenseCategory =
  (typeof ExpenseCategory)[keyof typeof ExpenseCategory];
  
export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  expenseDate: string;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  category: ExpenseCategory;
  amount: number;
  description: string;
  expenseDate?: string;
  reference?: string;
  currency?: string;
  notes?: string;
}

export const expenseService = {
  // GET /api/v1/expenses
  async getAll(): Promise<Expense[]> {
    const response = await api.get("/expenses");

    return response.data.data || [];
  },

  // GET /api/v1/expenses/:id
  async getById(id: string): Promise<Expense> {
    const response = await api.get(`/expenses/${id}`);

    return response.data.data;
  },

  // POST /api/v1/expenses
  async create(data: CreateExpensePayload) {
    const response = await api.post("/expenses", data);

    return response.data;
  },

  // PUT /api/v1/expenses/:id
  async update(
    id: string,
    data: Partial<CreateExpensePayload>
  ) {
    const response = await api.put(
      `/expenses/${id}`,
      data
    );

    return response.data;
  },

  // DELETE /api/v1/expenses/:id
  async delete(id: string) {
    const response = await api.delete(
      `/expenses/${id}`
    );

    return response.data;
  },
};