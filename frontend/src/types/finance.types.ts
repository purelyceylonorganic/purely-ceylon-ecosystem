export interface FinanceExpenses {
  total: number;
  byCategory: Record<string, number>;
}

export interface FinanceAnalytics {
  revenue: number;

  expenses: FinanceExpenses;

  productCost: number;

  grossProfit: number;

  netProfit: number;

  grossProfitMargin: number;

  netProfitMargin: number;

  currency: string;
}

export interface FinanceAnalyticsResponse {
  success: boolean;
  data: FinanceAnalytics;
}

export interface MonthlyFinanceData {
  month: string;
  revenue: number;
  productCost: number;
  operatingExpenses: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface MonthlyFinanceResponse {
  success: boolean;
  year: number;
  data: MonthlyFinanceData[];

  totals: {
    revenue: number;
    productCost: number;
    operatingExpenses: number;
    expenses: number;
    grossProfit: number;
    netProfit: number;
  };

  currency: string;
}