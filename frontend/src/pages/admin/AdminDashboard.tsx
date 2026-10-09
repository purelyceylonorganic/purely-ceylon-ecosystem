
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { orderService } from "../../services/order.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Download,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import RevenueChart from "../../components/admin/RevenueChart";

type DashboardStats = {
  revenue?: number;
  totalRevenue?: number;
  orders?: number;
  totalOrders?: number;
  customers?: number;
  totalCustomers?: number;
  delivered?: number;
  deliveredOrders?: number;
  recentOrders?: any[];
  [key: string]: any;
};

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF8EE] text-[#0E4B32]">
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 break-words text-2xl font-extrabold text-[#0E4B32] sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

const cardClass =
  "min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:p-6";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [topAnalytics, setTopAnalytics] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadMonthlySales = useCallback(async () => {
    try {
      const response = await api.get("/admin/monthly-sales");
      const result = response.data;

      if (result.success && result.data) {
        const chartData = Object.entries(result.data).map(
          ([month, revenue]) => ({
            month,
            revenue: Number(revenue),
          })
        );

        setMonthlySales(chartData);
      }
    } catch (error) {
      console.error("Chart data loading error:", error);
    }
  }, []);

  const loadTopProducts = useCallback(async () => {
    try {
      const response = await api.get("/admin/top-products");
      const result = response.data;

      if (result.success) {
        setTopProducts(result.data || []);
      }
    } catch (error) {
      console.error("Top Products Error:", error);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      try {
        const response = await orderService.getDashboardStats();

        setStats(
          response.stats ||
            response.data?.data ||
            response.data
        );
      } catch (error) {
        console.error(
          "Fallback route used to fetch dashboard stats:",
          error
        );

        const response = await api.get("/admin/revenue-dashboard");

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          throw new Error("Dashboard statistics unavailable");
        }
      }

      await Promise.all([
        loadMonthlySales(),
        loadTopProducts(),
      ]);

      try {
        const response = await api.get("/admin/top-analytics");

        if (response.data.success) {
          setTopAnalytics(response.data);
        }
      } catch (error) {
        console.error("Top Analytics Error:", error);
      }
    } catch (error) {
      console.error("Dashboard data loading error:", error);
      setLoadError(true);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  }, [loadMonthlySales, loadTopProducts]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      toast.loading("Generating PDF report...", { id: "pdf" });

      const response = await api.get("/admin/revenue-report/pdf", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `Revenue_Report_${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF exported successfully!", { id: "pdf" });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to generate PDF report", { id: "pdf" });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center text-[#0E4B32]">
        <RefreshCw className="animate-spin" size={30} />
        <p className="text-sm font-semibold sm:text-base">
          Loading dashboard metrics...
        </p>
      </div>
    );
  }

  if (loadError || !stats) {
    return (
      <div className="mx-auto flex min-h-[35vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-600">
          <RefreshCw size={28} />
        </div>
        <h2 className="text-lg font-bold text-gray-800">
          Dashboard data could not be loaded
        </h2>
        <p className="text-sm leading-6 text-gray-500">
          Check your connection and admin permissions, then try again.
        </p>
        <button
          type="button"
          onClick={() => void fetchDashboard()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white hover:bg-[#093b27]"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  const recentOrders = Array.isArray(stats.recentOrders)
    ? stats.recentOrders
    : [];

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 sm:space-y-7">
      {/* Dashboard heading and actions */}
      <section className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
            Purely Ceylon Organic
          </p>
          <h1 className="mt-1 text-xl font-extrabold text-[#0E4B32] sm:text-2xl lg:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor revenue, orders and business performance.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
          <Link
            to="/admin/products/create"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#093b27]"
          >
            <Package size={17} />
            Create Product
          </Link>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exporting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-white px-4 py-3 text-sm font-bold text-[#0E4B32] transition hover:bg-[#FFF8EE] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={17} />
            {exporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </section>

      {/* Metric cards */}
      <section className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-4 lg:gap-5">
        <MetricCard
          title="Total Revenue"
          value={`USD ${stats.revenue ?? stats.totalRevenue ?? 0}`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Orders"
          value={stats.orders ?? stats.totalOrders ?? 0}
          icon={ShoppingBag}
        />
        <MetricCard
          title="Customers"
          value={stats.customers ?? stats.totalCustomers ?? 0}
          icon={Users}
        />
        <MetricCard
          title="Delivered Orders"
          value={stats.delivered ?? stats.deliveredOrders ?? 0}
          icon={Package}
        />
      </section>

      {/* Responsive main grid */}
      <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Main column */}
        <div className="min-w-0 space-y-5 lg:col-span-2 lg:space-y-6">
          <div className="min-w-0 overflow-hidden rounded-2xl">
            <RevenueChart data={monthlySales} darkMode={false} />
          </div>

          {/* Top products chart */}
          <div className={cardClass}>
            <h2 className="mb-4 text-base font-bold text-gray-800 sm:text-lg">
              Top Selling Products
            </h2>

            <div className="h-[260px] min-w-0 sm:h-[320px]">
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts}
                    margin={{ top: 8, right: 8, left: -18, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#eee"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#666"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#666"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="quantity"
                      name="Quantity Sold"
                      fill="#0E4B32"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  No product sales data available.
                </div>
              )}
            </div>
          </div>

          {/* Recent orders: horizontally scrollable on small screens */}
          <div className={`${cardClass} overflow-hidden`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-gray-800 sm:text-lg">
                Recent Orders
              </h2>
              <Link
                to="/admin/orders"
                className="text-sm font-bold text-[#0E4B32] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="px-3 py-3 text-xs font-semibold text-gray-500">
                      Order ID
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-500">
                      Customer
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-500">
                      Total
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-[#0E4B32]">
                          #{String(order.id).slice(0, 8).toUpperCase()}
                        </td>
                        <td className="max-w-[220px] truncate px-3 py-4 text-sm text-gray-600">
                          {order.user?.fullName || "Guest Customer"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-700">
                          USD {order.totalFinal ?? 0}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-bold ${
                              order.status === "DELIVERED"
                                ? "bg-teal-50 text-teal-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {order.status || "PENDING"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-8 text-center text-sm text-gray-500"
                      >
                        No recent orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-400 sm:hidden">
              Swipe horizontally to see all order details.
            </p>
          </div>
        </div>

        {/* Side column */}
        <aside className="min-w-0 space-y-5 lg:space-y-6">
          <div className={cardClass}>
            <h2 className="mb-4 text-base font-bold text-gray-800 sm:text-lg">
              Top Selling Items
            </h2>

            {topAnalytics?.topProducts?.length > 0 ? (
              <ol className="space-y-3">
                {topAnalytics.topProducts.map(
                  (item: any, index: number) => (
                    <li
                      key={item.productVariantId || index}
                      className="flex min-w-0 items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF8EE] text-xs font-bold text-[#0E4B32]">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="break-all text-sm font-semibold text-gray-700">
                          Variant:{" "}
                          {item.productVariantId?.slice(0, 8) ||
                            "Unknown"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {item._sum?.quantity || 0} sales
                        </p>
                      </div>
                    </li>
                  )
                )}
              </ol>
            ) : (
              <p className="text-sm text-gray-500">
                No sales data available.
              </p>
            )}
          </div>

          <div className={cardClass}>
            <h2 className="mb-4 text-base font-bold text-gray-800 sm:text-lg">
              Top Customers
            </h2>

            {topAnalytics?.topCustomers?.length > 0 ? (
              <div className="space-y-3">
                {topAnalytics.topCustomers.map((customer: any) => {
                  const totalSpent =
                    customer.orders?.reduce(
                      (sum: number, order: any) =>
                        sum + (Number(order.totalFinal) || 0),
                      0
                    ) || 0;

                  return (
                    <div
                      key={customer.id}
                      className="flex min-w-0 items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF8EE] text-[#0E4B32]">
                          <Users size={17} />
                        </div>
                        <p className="break-words text-sm font-semibold text-gray-700">
                          {customer.fullName || "Unnamed"}
                        </p>
                      </div>
                      <p className="shrink-0 break-words text-right text-sm font-bold text-[#0E4B32]">
                        USD {totalSpent.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No customer data available.
              </p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
