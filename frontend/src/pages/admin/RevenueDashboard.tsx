import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import RevenueChart from "../../components/admin/RevenueChart"; 

export default function RevenueDashboard() {
  // ==========================================
  // ⏳ STATES
  // ==========================================
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueStats, setRevenueStats] = useState<any>(null); 
  const [monthlySales, setMonthlySales] = useState<Record<string, number>>({});
  
  // New Analytics & System States
  const [countryRevenue, setCountryRevenue] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]); // API Array format integration
  const [lastUpdated, setLastUpdated] = useState("");
  const [kpiGrowth, setKpiGrowth] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);

  // ==========================================
  // ⚙️ API LOADERS
  // ==========================================
  
  // 1. Load Main Dashboard & Recent Orders
  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/admin/revenue-dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setRevenueStats(result.data);
        setRecentOrders(result.data.recentOrders || []);
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  // 2. Load Monthly Sales
  const loadMonthlySales = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/admin/monthly-sales", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setMonthlySales(result.data || {});
      }
    } catch (error) {
      console.error("Monthly Sales Error:", error);
    }
  };

  // 3. Load Top Selling Products
  const loadTopProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/admin/top-products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      setTopProducts(result.data || []);
    } catch (error) {
      console.error("Top Products Error:", error);
    }
  };

  // 4. Load Top Customers
  const loadTopCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/admin/top-customers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      setTopCustomers(result.data || []);
    } catch (error) {
      console.error("Top Customers Error:", error);
    }
  };

  // 5. Load Country Revenue Analytics
  const loadCountryRevenue = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/admin/revenue-country", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setCountryRevenue(result.data || []);
      }
    } catch (error) {
      console.error("Country Revenue Error:", error);
    }
  };

  // 6. Load Admin Notifications (Integrated Array Response)
  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error("Notifications Error:", error);
    }
  };

  // 7. Load KPI Growth Analytics
  const loadKPIGrowth = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/admin/kpi-growth", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setKpiGrowth(result.data);
      }
    } catch (error) {
      console.error("KPI Growth Error:", error);
    }
  };

  // 8. Download Revenue PDF
  const downloadRevenuePDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/admin/revenue-pdf", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Revenue-Report.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("PDF Download Failed");
    }
  };

  // ==========================================
  // 🔄 THEME TOGGLE FUNCTION
  // ==========================================
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("admin-theme", newTheme ? "dark" : "light");
  };

  // ==========================================
  // 🔄 INITIAL LOAD & AUTO REFRESH
  // ==========================================
  useEffect(() => {
    // Theme setup from local storage
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }

    const loadAllData = () => {
      loadDashboard();
      loadMonthlySales();
      loadTopProducts();
      loadTopCustomers();
      loadCountryRevenue();
      loadNotifications();
      loadKPIGrowth();
      setLastUpdated(new Date().toLocaleTimeString());
    };

    // Initial Trigger
    loadAllData();

    // Auto Refresh Every 30 Seconds
    const interval = setInterval(() => {
      loadAllData();
      console.log("🔄 Dashboard Auto Refreshed");
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // 📊 DATA FORMATTING FOR REVENUE CHART
  // ==========================================
  const chartData = Object.entries(monthlySales).map(([month, revenue]) => ({
    month,
    revenue: Number(revenue)
  }));

  // ==========================================
  // 🎨 DARK MODE COMPLIANT THEME STYLES
  // ==========================================
  const cardStyle = {
    background: darkMode ? "#1F2937" : "#ffffff",
    color: darkMode ? "#ffffff" : "#111827",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  };

  const tableHeaderStyle = {
    borderBottom: darkMode ? "2px solid #374151" : "2px solid #eee",
    height: "40px",
    color: darkMode ? "#9CA3AF" : "#666"
  };

  const tableRowStyle = {
    borderBottom: darkMode ? "1px solid #374151" : "1px solid #f9f9f9",
    height: "45px"
  };

  // ==========================================
  // 🎨 UI RENDERING
  // ==========================================
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        background: darkMode ? "#111827" : "#f5f7fb",
        color: darkMode ? "#ffffff" : "#111827",
        transition: "background 0.3s s, color 0.3s"
      }}
    >
      
      {/* 📄 DASHBOARD HEADER & CONFIGURATION */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "15px"
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>📊 Admin Revenue Dashboard</h2>
          <span style={{ fontSize: "13px", color: darkMode ? "#9CA3AF" : "#666" }}>
            Last Updated: {lastUpdated}
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            style={{
              padding: "10px 15px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              background: darkMode ? "#374151" : "#E5E7EB",
              color: darkMode ? "#fff" : "#000",
              transition: "all 0.2s"
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* PDF Download Button */}
          <button
            onClick={downloadRevenuePDF}
            style={{
              background: "#0E4B32",
              color: "#fff",
              border: "none",
              padding: "10px 15px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 5px rgba(14,75,50,0.2)"
            }}
          >
            📄 Export Revenue PDF
          </button>
        </div>
      </div>

      {/* 📈 KPI CARDS SECTION */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "25px"
        }}
      >
        <div style={cardStyle}>
          <h4 style={{ margin: "0 0 10px 0", color: darkMode ? "#9CA3AF" : "#666" }}>💰 Revenue</h4>
          <h2 style={{ margin: "0 0 5px 0" }}>USD {revenueStats?.revenue || 0}</h2>
          {kpiGrowth && (
            <p style={{ margin: 0, color: kpiGrowth.revenueGrowth >= 0 ? "#10B981" : "#EF4444", fontSize: "14px", fontWeight: "500" }}>
              {kpiGrowth.revenueGrowth >= 0 ? "▲" : "▼"} {Math.abs(kpiGrowth.revenueGrowth)}%
            </p>
          )}
        </div>

        <div style={cardStyle}>
          <h4 style={{ margin: "0 0 10px 0", color: darkMode ? "#9CA3AF" : "#666" }}>📦 Orders</h4>
          <h2 style={{ margin: "0 0 5px 0" }}>{revenueStats?.orders || 0}</h2>
          {kpiGrowth && (
            <p style={{ margin: 0, color: kpiGrowth.orderGrowth >= 0 ? "#10B981" : "#EF4444", fontSize: "14px", fontWeight: "500" }}>
              {kpiGrowth.orderGrowth >= 0 ? "▲" : "▼"} {Math.abs(kpiGrowth.orderGrowth)}%
            </p>
          )}
        </div>

        <div style={cardStyle}>
          <h4 style={{ margin: "0 0 10px 0", color: darkMode ? "#9CA3AF" : "#666" }}>👥 Customers</h4>
          <h2 style={{ margin: "0 0 5px 0" }}>{revenueStats?.customers || 0}</h2>
          {kpiGrowth && (
            <p style={{ margin: 0, color: kpiGrowth.customerGrowth >= 0 ? "#10B981" : "#EF4444", fontSize: "14px", fontWeight: "500" }}>
              {kpiGrowth.customerGrowth >= 0 ? "▲" : "▼"} {Math.abs(kpiGrowth.customerGrowth)}%
            </p>
          )}
        </div>

        <div style={cardStyle}>
          <h4 style={{ margin: "0 0 10px 0", color: darkMode ? "#9CA3AF" : "#666" }}>🚚 Delivered</h4>
          <h2 style={{ margin: "0 0 5px 0" }}>{revenueStats?.delivered || 0}</h2>
          {kpiGrowth && (
            <p style={{ margin: 0, color: kpiGrowth.deliveredGrowth >= 0 ? "#10B981" : "#EF4444", fontSize: "14px", fontWeight: "500" }}>
              {kpiGrowth.deliveredGrowth >= 0 ? "▲" : "▼"} {Math.abs(kpiGrowth.deliveredGrowth)}%
            </p>
          )}
        </div>
      </div>

      {/* 📊 REVENUE ANALYTICS LINE CHART */}
      <div style={{ marginBottom: "25px" }}>
        <RevenueChart data={chartData} darkMode={darkMode} />
      </div>

      {/* 🔔 NOTIFICATIONS PANEL (Array-based UI Block) */}
      <div style={{ ...cardStyle, marginTop: "25px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "15px" }}>🔔 Notifications</h3>
        {notifications.map((n: any) => (
          <div
            key={n.id}
            style={{
              padding: "12px",
              borderBottom: darkMode ? "1px solid #374151" : "1px solid #eee"
            }}
          >
            <div style={{ fontWeight: "bold" }}>{n.title}</div>
            <div style={{ fontSize: "14px", color: darkMode ? "#9CA3AF" : "#666" }}>{n.message}</div>
          </div>
        ))}
        {notifications.length === 0 && (
          <p style={{ textAlign: "center", color: "#999", margin: "10px 0" }}>No new notifications</p>
        )}
      </div>

      {/* 🏆 TOP SELLING PRODUCTS BAR CHART */}
      <div style={{ ...cardStyle, marginTop: "25px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
          🏆 Top Selling Products
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#eee"} />
            <XAxis dataKey="name" stroke={darkMode ? "#fff" : "#666"} fontSize={12} tickLine={false} />
            <YAxis stroke={darkMode ? "#fff" : "#666"} fontSize={12} tickLine={false} />
            <Tooltip contentStyle={{ background: darkMode ? "#1F2937" : "#fff", borderColor: "#666", color: darkMode ? "#fff" : "#000" }} />
            <Bar dataKey="quantity" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🌍 REVENUE BY COUNTRY CHART */}
      <div style={{ ...cardStyle, marginTop: "25px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
          🌍 Revenue By Country
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={countryRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#eee"} />
            <XAxis dataKey="country" stroke={darkMode ? "#fff" : "#666"} fontSize={12} tickLine={false} />
            <YAxis stroke={darkMode ? "#fff" : "#666"} fontSize={12} tickLine={false} />
            <Tooltip contentStyle={{ background: darkMode ? "#1F2937" : "#fff", borderColor: "#666", color: darkMode ? "#fff" : "#000" }} />
            <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 👥 TABLES SECTION */}
      <div 
        style={{ 
          display: "flex", 
          gap: "25px", 
          marginTop: "25px", 
          flexWrap: "wrap" 
        }}
      >
        {/* 👥 TOP CUSTOMERS TABLE */}
        <div style={{ ...cardStyle, flex: "1 1 45%", minWidth: "300px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
            👥 Top Customers
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", color: darkMode ? "#fff" : "#111827" }}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th>Name</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer: any) => (
                <tr key={customer.id} style={tableRowStyle}>
                  <td style={{ fontWeight: 500 }}>{customer.name || "N/A"}</td>
                  <td>{customer.orders}</td>
                  <td style={{ color: "#10B981", fontWeight: "bold" }}>USD {customer.revenue}</td>
                </tr>
              ))}
              {topCustomers.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📦 RECENT ORDERS TABLE */}
        <div style={{ ...cardStyle, flex: "1 1 45%", minWidth: "300px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
            📦 Recent Orders
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", color: darkMode ? "#fff" : "#111827" }}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order.id} style={tableRowStyle}>
                  <td style={{ fontFamily: "monospace", color: "#4F46E5" }}>
                    #{order.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td>{order.user?.fullName || "Guest Customer"}</td>
                  <td style={{ fontWeight: 600 }}>USD {order.totalFinal}</td>
                  <td>
                    <span 
                      style={{
                        padding: "4px 8px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 500,
                        background: order.status === "DELIVERED" ? "#E0F2FE" : "#FEF3C7",
                        color: order.status === "DELIVERED" ? "#0369A1" : "#D97706"
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}