import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { financeService } from "../../../services/finance.service";

import type {
  FinanceAnalytics,
  MonthlyFinanceData,
} from "../../../types/finance.types";


import { useNavigate } from "react-router-dom";

const CATEGORY_LABELS: Record<string, string> = {
  PRODUCT_COST: "Product Cost",
  PACKAGING: "Packaging",
  PETROL: "Petrol",
  SALARY: "Salary",
  MAINTENANCE: "Maintenance",
  FINANCE: "Finance",
  SHIPPING: "Shipping",
  MARKETING: "Marketing",
  OTHER: "Other",
};

const DONUT_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#64748b",
];

const formatMoney = (
  value: number,
  currency = "LKR"
) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

const formatPercent = (value: number) => {
  return `${Number(value || 0).toFixed(1)}%`;
};

const getCurrentYear = () => new Date().getFullYear();

export default function FinanceDashboard() {

  const navigate = useNavigate();
  const [analytics, setAnalytics] =
    useState<FinanceAnalytics | null>(null);

  const [monthlyData, setMonthlyData] =
    useState<MonthlyFinanceData[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [year, setYear] = useState(getCurrentYear());
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currency, setCurrency] = useState("LKR");

  const loadFinanceData = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const [summaryResponse, monthlyResponse] =
      await Promise.all([
        financeService.getAnalytics({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          currency,
        }),

        financeService.getMonthlyAnalytics(year, {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          currency,
        }),
      ]);

    if (summaryResponse.success) {
      setAnalytics(summaryResponse.data);
    }

    if (monthlyResponse.success) {
      setMonthlyData(monthlyResponse.data);
    }
  } catch (err: any) {
    console.error(
      "Finance Dashboard Loading Error:",
      err
    );

    setError(
      err?.response?.data?.message ||
        "Failed to load finance data"
    );
  } finally {
    setLoading(false);
  }
}, [year, startDate, endDate, currency]);


  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const categoryEntries = useMemo(() => {
    if (!analytics?.expenses?.byCategory) {
      return [];
    }

    return Object.entries(
      analytics.expenses.byCategory
    )
      .map(([category, amount]) => ({
        category,
        label:
          CATEGORY_LABELS[category] || category,
        amount: Number(amount || 0),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [analytics]);


  if (loading && !analytics) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />

          <p className="text-sm text-slate-500">
            Loading finance dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-700" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Finance Dashboard
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Business financial performance
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* Year */}

            <div className="relative">
              <CalendarDays
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              />

              <select
                value={year}
                onChange={(e) =>
                  setYear(Number(e.target.value))
                }
                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[0, 1, 2, 3].map((offset) => {
                  const selectedYear =
                    getCurrentYear() - offset;

                  return (
                    <option
                      key={selectedYear}
                      value={selectedYear}
                    >
                      {selectedYear}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Refresh */}

            <button
              onClick={loadFinanceData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 transition"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>


           <button
  onClick={() => navigate("/admin/finance/expenses")}
  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 transition"
>
  Manage Expenses
</button> 

          </div>
        </div>


{/* =========================================
    FINANCE FILTERS
========================================= */}

<div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5">

  <div className="flex flex-col lg:flex-row lg:items-end gap-4">

    {/* Start Date */}

    <div className="flex-1">
      <label className="block text-sm font-medium text-slate-600 mb-2">
        From Date
      </label>

      <input
        type="date"
        value={startDate}
        onChange={(e) =>
          setStartDate(e.target.value)
        }
        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>

    {/* End Date */}

    <div className="flex-1">
      <label className="block text-sm font-medium text-slate-600 mb-2">
        To Date
      </label>

      <input
        type="date"
        value={endDate}
        onChange={(e) =>
          setEndDate(e.target.value)
        }
        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>

    {/* Currency */}

    <div className="w-full lg:w-40">
      <label className="block text-sm font-medium text-slate-600 mb-2">
        Currency
      </label>

      <select
        value={currency}
        onChange={(e) =>
          setCurrency(e.target.value)
        }
        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="LKR">LKR</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>
    </div>

    {/* Clear */}

    <button
      type="button"
      onClick={() => {
        setStartDate("");
        setEndDate("");
        setCurrency("LKR");
      }}
      disabled={
        !startDate &&
        !endDate &&
        currency === "LKR"
      }
      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      Clear Filters
    </button>

  </div>

  {(startDate || endDate) && (
    <p className="mt-3 text-xs text-slate-500">
      Showing finance data
      {startDate ? ` from ${startDate}` : ""}
      {endDate ? ` to ${endDate}` : ""}
    </p>
  )}

</div>

        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =========================================
            KPI CARDS
        ========================================= */}

        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Revenue */}

            <FinanceCard
              title="Revenue"
              value={formatMoney(
                analytics.revenue,
                analytics.currency
              )}
              subtitle="Total business revenue"
              icon={
                <TrendingUp className="w-5 h-5" />
              }
              positive
            />

            {/* Expenses */}

            <FinanceCard
              title="Total Expenses"
              value={formatMoney(
                analytics.expenses.total,
                analytics.currency
              )}
              subtitle="All recorded expenses"
              icon={
                <TrendingDown className="w-5 h-5" />
              }
            />
           

            {/* Gross Profit */}

            <FinanceCard
              title="Gross Profit"
              value={formatMoney(
                analytics.grossProfit,
                analytics.currency
              )}
              subtitle={`Margin ${formatPercent(
                analytics.grossProfitMargin
              )}`}
              icon={
                <BarChart3 className="w-5 h-5" />
              }
              positive
            />

            {/* Net Profit */}

            <FinanceCard
              title="Net Profit"
              value={formatMoney(
                analytics.netProfit,
                analytics.currency
              )}
              subtitle={`Margin ${formatPercent(
                analytics.netProfitMargin
              )}`}
              icon={
                <CircleDollarSign className="w-5 h-5" />
              }
              positive
            />

          </div>
        )}

        {/* =========================================
            PROFIT SUMMARY
        ========================================= */}

        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Product Cost
              </p>

              <p className="text-xl font-bold text-slate-900 mt-2">
                {formatMoney(
                  analytics.productCost,
                  analytics.currency
                )}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Gross Profit Margin
              </p>

              <p className="text-xl font-bold text-emerald-600 mt-2">
                {formatPercent(
                  analytics.grossProfitMargin
                )}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Net Profit Margin
              </p>

              <p className="text-xl font-bold text-blue-600 mt-2">
                {formatPercent(
                  analytics.netProfitMargin
                )}
              </p>
            </div>

          </div>
        )}

       {/* =========================================
    MONTHLY PERFORMANCE CHART
========================================= */}

<div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

  <div className="p-5 border-b border-slate-100">

    <div className="flex items-center justify-between">

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Monthly Financial Performance
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Revenue, expenses and profit for {year}
        </p>
      </div>

      <BarChart3 className="w-5 h-5 text-slate-400" />

    </div>

  </div>

  <div className="p-5">

    {monthlyData.length === 0 ? (

      <div className="py-16 text-center text-slate-500">
        No monthly finance data found.
      </div>

    ) : (

      <div className="w-full h-[420px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart
            data={monthlyData}
            margin={{
              top: 20,
              right: 20,
              left: 10,
              bottom: 20,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickFormatter={formatChartMonth}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                formatCompactMoney(value)
              }
            />

            <Tooltip
             formatter={(value) =>
  formatMoney(Number(value ?? 0))
}
              labelFormatter={(label) =>
                formatChartMonth(String(label))
              }
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.08)",
              }}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />

            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
            />

            <Line
              type="monotone"
              dataKey="grossProfit"
              name="Gross Profit"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />

            <Line
              type="monotone"
              dataKey="netProfit"
              name="Net Profit"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    )}

  </div>

</div>

        {/* =========================================
    EXPENSE BREAKDOWN
========================================= */}

<div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

  <div className="p-5 border-b border-slate-100">

    <div className="flex items-center justify-between">

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Expense Breakdown
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Expenses grouped by category
        </p>
      </div>

      <Wallet className="w-5 h-5 text-slate-400" />

    </div>

  </div>

  <div className="p-5">

    {categoryEntries.length === 0 ? (

      <div className="py-12 text-center">

        <Wallet className="w-10 h-10 mx-auto text-slate-300" />

        <p className="mt-3 text-sm text-slate-500">
          No expenses recorded yet.
        </p>

      </div>

    ) : (

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* =====================================
            DONUT CHART
        ===================================== */}

        <div className="h-[360px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <PieChart>

              <Pie
                data={categoryEntries}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={135}
                paddingAngle={3}
                strokeWidth={2}
              >

                {categoryEntries.map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${entry.category}`}
                      fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                    />
                  )
                )}

              </Pie>

              <Tooltip
                formatter={(value) =>
                  formatMoney(
                    Number(value ?? 0),
                    analytics?.currency || "LKR"
                  )
                }
              />

            </PieChart>

          </ResponsiveContainer>

          {/* Center value */}

          <div className="relative -mt-[220px] flex justify-center pointer-events-none">

            <div className="text-center">

              <p className="text-xs text-slate-400">
                Total Expenses
              </p>

              <p className="text-xl font-bold text-slate-900 mt-1">
                {formatMoney(
                  analytics?.expenses.total || 0,
                  analytics?.currency || "LKR"
                )}
              </p>

            </div>

          </div>

        </div>

        {/* =====================================
            CATEGORY LEGEND
        ===================================== */}

        <div className="space-y-4">

          {categoryEntries.map((item, index) => {

            const percentage =
              analytics &&
              analytics.expenses.total > 0
                ? (item.amount /
                    analytics.expenses.total) *
                  100
                : 0;

            return (
              <div
                key={item.category}
                className="flex items-center justify-between gap-4"
              >

                <div className="flex items-center gap-3 min-w-0">

                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        DONUT_COLORS[
                          index %
                            DONUT_COLORS.length
                        ],
                    }}
                  />

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {item.label}
                    </p>

                    <p className="text-xs text-slate-400">
                      {percentage.toFixed(1)}% of expenses
                    </p>

                  </div>

                </div>

                <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                  {formatMoney(
                    item.amount,
                    analytics?.currency || "LKR"
                  )}
                </p>

              </div>
            );

          })}

        </div>

      </div>

    )}

  </div>

</div>

        {/* =========================================
            FOOTER SUMMARY
        ========================================= */}

        {analytics && (
          <div className="bg-slate-900 rounded-2xl p-5 md:p-6 text-white">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div>
                <p className="text-sm text-slate-400">
                  Revenue
                </p>

                <p className="text-xl font-bold mt-1">
                  {formatMoney(
                    analytics.revenue,
                    analytics.currency
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Expenses
                </p>

                <p className="text-xl font-bold mt-1">
                  {formatMoney(
                    analytics.expenses.total,
                    analytics.currency
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Net Profit
                </p>

                <p className="text-xl font-bold mt-1 text-emerald-400">
                  {formatMoney(
                    analytics.netProfit,
                    analytics.currency
                  )}
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// =====================================================
// FINANCE CARD
// =====================================================

interface FinanceCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  positive?: boolean;
}

function FinanceCard({
  title,
  value,
  subtitle,
  icon,
  positive = false,
}: FinanceCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-2">
            {value}
          </p>

          <p className="text-xs text-slate-500 mt-2">
            {subtitle}
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            positive
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </div>

      </div>

      <div className="flex items-center gap-1 mt-4">

        {positive ? (
          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-slate-400" />
        )}

        <span className="text-xs text-slate-500">
          Finance analytics
        </span>

      </div>

    </div>
  );
}

// =====================================================
// MONTH FORMAT
// =====================================================

function formatChartMonth(value: string) {
  const date = new Date(`${value}-01`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
  });
}

function formatCompactMoney(value: number) {
  const amount = Number(value || 0);

  if (amount >= 1_000_000) {
    return `LKR ${(amount / 1_000_000).toFixed(1)}M`;
  }

  if (amount >= 1_000) {
    return `LKR ${(amount / 1_000).toFixed(0)}K`;
  }

  return `LKR ${amount.toFixed(0)}`;
}