import api from "../api/axios";

import type {
  FinanceAnalyticsResponse,
  MonthlyFinanceResponse,
} from "../types/finance.types";

export interface FinanceAnalyticsParams {
  startDate?: string;
  endDate?: string;
  currency?: string;
}

export interface MonthlyFinanceParams {
  year: number;
  startDate?: string;
  endDate?: string;
  currency?: string;
}

export const financeService = {

  // ==========================================
  // FINANCE SUMMARY
  // GET /api/v1/finance/analytics
  // ==========================================

  async getAnalytics(
    params?: FinanceAnalyticsParams
  ): Promise<FinanceAnalyticsResponse> {

    const response = await api.get(
      "/finance/analytics",
      {
        params,
      }
    );

    return response.data;
  },

  // ==========================================
  // MONTHLY FINANCE
  // GET /api/v1/finance/monthly
  // ==========================================

  async getMonthlyAnalytics(
    year: number,
    params?: Omit<MonthlyFinanceParams, "year">
  ): Promise<MonthlyFinanceResponse> {

    const response = await api.get(
      "/finance/monthly",
      {
        params: {
          year,
          ...params,
        },
      }
    );

    return response.data;
  },
};