import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import RevenueChart from "../../components/admin/RevenueChart";

type AnyRecord = Record<string, any>;

export default function RevenueDashboard() {
  const [topProducts, setTopProducts] = useState<AnyRecord[]>([]);
  const [topCustomers, setTopCustomers] = useState<AnyRecord[]>([]);
  const [recentOrders, setRecentOrders] = useState<AnyRecord[]>([]);
  const [revenueStats, setRevenueStats] = useState<AnyRecord | null>(null);
  const [monthlySales, setMonthlySales] = useState<Record<string, number>>({});
  const [countryRevenue, setCountryRevenue] = useState<AnyRecord[]>([]);
  const [notifications, setNotifications] = useState<AnyRecord[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [kpiGrowth, setKpiGrowth] = useState<AnyRecord | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const loadDashboard = useCallback(async () => {
    const response = await api.get("/admin/revenue-dashboard");
    const result = response.data;
    if (result?.success) {
      setRevenueStats(result.data ?? null);
      setRecentOrders(result.data?.recentOrders ?? []);
    }
  }, []);

  const loadMonthlySales = useCallback(async () => {
    const response = await api.get("/admin/monthly-sales");
    const result = response.data;
    if (result?.success) setMonthlySales(result.data ?? {});
  }, []);

  const loadTopProducts = useCallback(async () => {
    const response = await api.get("/admin/top-products");
    const result = response.data;
    if (result?.success) setTopProducts(result.data ?? []);
  }, []);

  const loadTopCustomers = useCallback(async () => {
    const response = await api.get("/admin/top-customers");
    const result = response.data;
    if (result?.success) setTopCustomers(result.data ?? []);
  }, []);

  const loadCountryRevenue = useCallback(async () => {
    const response = await api.get("/admin/revenue-country");
    const result = response.data;
    if (result?.success) setCountryRevenue(result.data ?? []);
  }, []);

  const loadNotifications = useCallback(async () => {
    const response = await api.get("/admin/notifications");
    const result = response.data;
    if (result?.success) setNotifications(result.data ?? []);
  }, []);

  const loadKPIGrowth = useCallback(async () => {
    const response = await api.get("/admin/kpi-growth");
    const result = response.data;
    if (result?.success) setKpiGrowth(result.data ?? null);
  }, []);

  const loadAllData = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    setDashboardError("");

    const results = await Promise.allSettled([
      loadDashboard(),
      loadMonthlySales(),
      loadTopProducts(),
      loadTopCustomers(),
      loadCountryRevenue(),
      loadNotifications(),
      loadKPIGrowth(),
    ]);

    const failedCount = results.filter((result) => result.status === "rejected").length;
    if (failedCount > 0) {
      setDashboardError(
        failedCount === results.length
          ? "Dashboard data could not be loaded. Please check your connection and try again."
          : "Some dashboard sections could not be refreshed. Previously loaded data may still be shown."
      );
    }

    setLastUpdated(new Date().toLocaleTimeString());
    setIsRefreshing(false);
  }, [
    loadDashboard,
    loadMonthlySales,
    loadTopProducts,
    loadTopCustomers,
    loadCountryRevenue,
    loadNotifications,
    loadKPIGrowth,
  ]);

  const downloadRevenuePDF = async () => {
    try {
      setPdfLoading(true);
      const response = await api.get("/admin/revenue-pdf", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Revenue-Report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.alert("Revenue PDF download failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      try {
        localStorage.setItem("admin-theme", next ? "dark" : "light");
      } catch {
        // The dashboard remains usable if local storage is unavailable.
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      setDarkMode(localStorage.getItem("admin-theme") === "dark");
    } catch {
      setDarkMode(false);
    }

    void loadAllData();
    const interval = window.setInterval(() => {
      void loadAllData();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadAllData]);

  const chartData = Object.entries(monthlySales).map(([month, revenue]) => ({
    month,
    revenue: Number(revenue),
  }));

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    minWidth: 0,
    padding: "clamp(12px, 3vw, 28px)",
    background: darkMode ? "#111827" : "#f5f7fb",
    color: darkMode ? "#f9fafb" : "#111827",
    transition: "background 0.2s ease, color 0.2s ease",
  };

  const cardStyle: React.CSSProperties = {
    minWidth: 0,
    background: darkMode ? "#1f2937" : "#ffffff",
    color: darkMode ? "#f9fafb" : "#111827",
    border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
    borderRadius: 14,
    padding: "clamp(14px, 2.5vw, 24px)",
    boxShadow: darkMode ? "none" : "0 2px 10px rgba(0,0,0,0.04)",
  };

  const mutedText = darkMode ? "#9ca3af" : "#6b7280";
  const tableHeaderStyle: React.CSSProperties = {
    borderBottom: `2px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
    height: 42,
    color: mutedText,
    textAlign: "left",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
  const tableRowStyle: React.CSSProperties = {
    borderBottom: `1px solid ${darkMode ? "#374151" : "#f3f4f6"}`,
    minHeight: 45,
  };

  const kpiCards = [
    {
      label: "💰 Revenue",
      value: `USD ${Number(revenueStats?.revenue ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      growth: kpiGrowth?.revenueGrowth,
    },
    {
      label: "📦 Orders",
      value: Number(revenueStats?.orders ?? 0).toLocaleString(),
      growth: kpiGrowth?.orderGrowth,
    },
    {
      label: "👥 Customers",
      value: Number(revenueStats?.customers ?? 0).toLocaleString(),
      growth: kpiGrowth?.customerGrowth,
    },
    {
      label: "🚚 Delivered",
      value: Number(revenueStats?.delivered ?? 0).toLocaleString(),
      growth: kpiGrowth?.deliveredGrowth,
    },
  ];

  return (
    <main style={pageStyle}>
      <div style={{ width: "100%", maxWidth: 1600, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 240px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(22px, 3vw, 30px)",
                lineHeight: 1.25,
                fontWeight: 800,
                overflowWrap: "anywhere",
              }}
            >
              📊 Admin Revenue Dashboard
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: mutedText }}>
              Last updated: {lastUpdated || "Loading..."}
              {isRefreshing ? " · Refreshing..." : ""}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 9,
              width: "100%",
            }}
          >
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                ...actionButtonStyle,
                background: darkMode ? "#374151" : "#e5e7eb",
                color: darkMode ? "#fff" : "#111827",
                flex: "1 1 120px",
              }}
            >
              {darkMode ? "☀️ Light mode" : "🌙 Dark mode"}
            </button>
            <button
              type="button"
              onClick={() => void loadAllData(true)}
              disabled={isRefreshing}
              style={{
                ...actionButtonStyle,
                background: darkMode ? "#374151" : "#fff",
                color: darkMode ? "#fff" : "#111827",
                border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                flex: "1 1 120px",
                opacity: isRefreshing ? 0.65 : 1,
              }}
            >
              {isRefreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
            <button
              type="button"
              onClick={() => void downloadRevenuePDF()}
              disabled={pdfLoading}
              style={{
                ...actionButtonStyle,
                background: "#0e4b32",
                color: "#fff",
                flex: "1 1 180px",
                opacity: pdfLoading ? 0.65 : 1,
              }}
            >
              {pdfLoading ? "Preparing PDF..." : "📄 Export Revenue PDF"}
            </button>
          </div>
        </header>

        {dashboardError && (
          <div
            role="alert"
            style={{
              marginBottom: 18,
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${darkMode ? "#7f1d1d" : "#fecaca"}`,
              background: darkMode ? "#451a1a" : "#fef2f2",
              color: darkMode ? "#fecaca" : "#991b1b",
              fontSize: 14,
            }}
          >
            <div>{dashboardError}</div>
            <button
              type="button"
              onClick={() => void loadAllData(true)}
              style={{
                ...actionButtonStyle,
                marginTop: 9,
                background: darkMode ? "#7f1d1d" : "#fee2e2",
                color: darkMode ? "#fff" : "#991b1b",
              }}
            >
              Try again
            </button>
          </div>
        )}

        <section
          aria-label="Key performance indicators"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          {kpiCards.map((item) => (
            <article key={item.label} style={cardStyle}>
              <h2 style={{ margin: 0, color: mutedText, fontSize: 14, fontWeight: 600 }}>
                {item.label}
              </h2>
              <p
                style={{
                  margin: "12px 0 6px",
                  fontSize: "clamp(22px, 3vw, 30px)",
                  lineHeight: 1.2,
                  fontWeight: 800,
                  overflowWrap: "anywhere",
                }}
              >
                {item.value}
              </p>
              {item.growth !== undefined && item.growth !== null && (
                <p
                  style={{
                    margin: 0,
                    color: Number(item.growth) >= 0 ? "#10b981" : "#ef4444",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {Number(item.growth) >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(Number(item.growth))}%
                </p>
              )}
            </article>
          ))}
        </section>

        <section style={{ marginBottom: 22, minWidth: 0 }}>
          <RevenueChart data={chartData} darkMode={darkMode} />
        </section>

        <section style={{ ...cardStyle, marginBottom: 22 }}>
          <h2 style={sectionHeadingStyle}>🔔 Notifications</h2>
          {notifications.length === 0 ? (
            <p style={{ margin: 0, textAlign: "center", color: mutedText, fontSize: 14 }}>
              No new notifications
            </p>
          ) : (
            <div>
              {notifications.map((notification: AnyRecord, index) => (
                <article
                  key={notification.id ?? `${notification.title ?? "notification"}-${index}`}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      index === notifications.length - 1
                        ? "none"
                        : `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                  }}
                >
                  <div style={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                    {notification.title || "Notification"}
                  </div>
                  <p style={{ margin: "5px 0 0", color: mutedText, fontSize: 14, overflowWrap: "anywhere" }}>
                    {notification.message || ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: 18,
            marginBottom: 22,
          }}
        >
          <article style={cardStyle}>
            <h2 style={sectionHeadingStyle}>🏆 Top Selling Products</h2>
            {topProducts.length === 0 ? (
              <p style={{ color: mutedText, textAlign: "center", fontSize: 14 }}>No data available</p>
            ) : (
              <div style={{ width: "100%", height: 320, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                    <XAxis
                      dataKey="name"
                      stroke={mutedText}
                      fontSize={11}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis stroke={mutedText} fontSize={11} tickLine={false} width={44} />
                    <Tooltip
                      contentStyle={{
                        background: darkMode ? "#1f2937" : "#fff",
                        borderColor: darkMode ? "#4b5563" : "#d1d5db",
                        color: darkMode ? "#fff" : "#111827",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="quantity" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>

          <article style={cardStyle}>
            <h2 style={sectionHeadingStyle}>🌍 Revenue by Country</h2>
            {countryRevenue.length === 0 ? (
              <p style={{ color: mutedText, textAlign: "center", fontSize: 14 }}>No data available</p>
            ) : (
              <div style={{ width: "100%", height: 320, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryRevenue} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                    <XAxis
                      dataKey="country"
                      stroke={mutedText}
                      fontSize={11}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis stroke={mutedText} fontSize={11} tickLine={false} width={54} />
                    <Tooltip
                      contentStyle={{
                        background: darkMode ? "#1f2937" : "#fff",
                        borderColor: darkMode ? "#4b5563" : "#d1d5db",
                        color: darkMode ? "#fff" : "#111827",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: 18,
          }}
        >
          <article style={cardStyle}>
            <h2 style={sectionHeadingStyle}>👥 Top Customers</h2>
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={tableStyle(darkMode)}>
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={cellStyle}>Name</th>
                    <th style={cellStyle}>Orders</th>
                    <th style={cellStyle}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer: AnyRecord, index) => (
                    <tr key={customer.id ?? `${customer.name ?? "customer"}-${index}`} style={tableRowStyle}>
                      <td style={{ ...cellStyle, fontWeight: 600, overflowWrap: "anywhere" }}>
                        {customer.name || "N/A"}
                      </td>
                      <td style={cellStyle}>{customer.orders ?? 0}</td>
                      <td style={{ ...cellStyle, color: "#10b981", fontWeight: 700, whiteSpace: "nowrap" }}>
                        USD {Number(customer.revenue ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {topCustomers.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ ...cellStyle, padding: 22, textAlign: "center", color: mutedText }}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article style={cardStyle}>
            <h2 style={sectionHeadingStyle}>📦 Recent Orders</h2>
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={tableStyle(darkMode)}>
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={cellStyle}>Order ID</th>
                    <th style={cellStyle}>Customer</th>
                    <th style={cellStyle}>Total</th>
                    <th style={cellStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: AnyRecord, index) => (
                    <tr key={order.id ?? `order-${index}`} style={tableRowStyle}>
                      <td style={{ ...cellStyle, fontFamily: "monospace", color: "#818cf8", whiteSpace: "nowrap" }}>
                        #{String(order.id ?? "").substring(0, 8).toUpperCase() || "N/A"}
                      </td>
                      <td style={{ ...cellStyle, overflowWrap: "anywhere" }}>
                        {order.user?.fullName || "Guest Customer"}
                      </td>
                      <td style={{ ...cellStyle, fontWeight: 600, whiteSpace: "nowrap" }}>
                        USD {Number(order.totalFinal ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                      </td>
                      <td style={cellStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            background: order.status === "DELIVERED" ? "#e0f2fe" : "#fef3c7",
                            color: order.status === "DELIVERED" ? "#0369a1" : "#92400e",
                          }}
                        >
                          {order.status || "UNKNOWN"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ ...cellStyle, padding: 22, textAlign: "center", color: mutedText }}>
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

const actionButtonStyle: React.CSSProperties = {
  minHeight: 44,
  padding: "10px 14px",
  border: "none",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
  lineHeight: 1.3,
};

const sectionHeadingStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "clamp(17px, 2vw, 20px)",
  fontWeight: 750,
  lineHeight: 1.3,
  overflowWrap: "anywhere",
};

const cellStyle: React.CSSProperties = {
  padding: "12px 10px",
  verticalAlign: "top",
  fontSize: 13,
};

function tableStyle(darkMode: boolean): React.CSSProperties {
  return {
    width: "100%",
    minWidth: 390,
    borderCollapse: "collapse",
    textAlign: "left",
    color: darkMode ? "#f9fafb" : "#111827",
  };
}
