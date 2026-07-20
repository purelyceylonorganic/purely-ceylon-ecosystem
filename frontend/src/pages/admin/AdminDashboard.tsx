import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { orderService } from "../../services/order.service";
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

// ==========================================
// 🧩 SUB-COMPONENTS
// ==========================================
function Card({ title, value }: any) {
  return (
    <div
      style={{
        padding: "25px",
        background: "#fff",
        borderRadius: "10px",
        border: "1px solid #eee",
        boxShadow: "0 2px 5px rgba(0,0,0,0.01)",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", color: "#4a5568", fontSize: "15px", fontWeight: "500" }}>
        {title}
      </h4>
      <h2 style={{ margin: "0", color: "#2d3748", fontSize: "24px", fontWeight: "bold" }}>
        {value}
      </h2>
    </div>
  );
}

export default function AdminDashboard() {
  // ==========================================
  // ⏳ STATES
  // ==========================================
  const [stats, setStats] = useState<any>(null);
  const [monthlySales, setMonthlySales] = useState<any[]>([]); 
  const [topAnalytics, setTopAnalytics] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  // ==========================================
  // ⚙️ API LOADERS
  // ==========================================

  const loadMonthlySales = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/admin/monthly-sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success && result.data) {
        const chartData = Object.entries(result.data).map(([month, revenue]) => ({
          month,
          revenue: Number(revenue),
        }));
        setMonthlySales(chartData);
      }
    } catch (error) {
      console.error("Chart data loading error:", error);
    }
  };

  const loadTopProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/admin/top-products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setTopProducts(result.data || []);
      }
    } catch (error) {
      console.error("Top Products Error:", error);
    }
  };

  // ==========================================
  // 🔄 USEEFFECT (INITIAL LOAD)
  // ==========================================
  useEffect(() => {
    async function fetchAllAnalytics() {
      try {
        setLoading(true);

        try {
          const response = await orderService.getDashboardStats();
          setStats(response.stats || response.data?.data || response.data);
        } catch (err) {
          console.error("Fallback route used to fetch dashboard stats:", err);
          const resStats = await axios.get("http://localhost:5000/api/v1/admin/revenue-dashboard");
          if (resStats.data.success) setStats(resStats.data.data);
        }

        await Promise.all([
          loadMonthlySales(),
          loadTopProducts()
        ]);

        const resTop = await axios.get("http://localhost:5000/api/v1/admin/top-analytics");
        if (resTop.data.success) setTopAnalytics(resTop.data);

      } catch (err) {
        console.error("Data loading error:", err);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }
    fetchAllAnalytics();
  }, []);

  // ==========================================
  // 📄 PDF EXPORT LOGIC
  // ==========================================
  const handleExportPDF = async () => {
    try {
      toast.loading("Generating PDF Report...", { id: "pdf" });
      const response = await axios.get("http://localhost:5000/api/v1/admin/revenue-report/pdf", {
        responseType: "blob", 
      });
      
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Revenue_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      toast.success("PDF exported successfully! 📄", { id: "pdf" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF file", { id: "pdf" });
    }
  };

  if (loading || !stats) {
    return (
      <div style={{ textAlign: "center", padding: 40, fontFamily: "system-ui, sans-serif", color: "#0E4B32" }}>
        <h2>Loading dashboard metrics...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* 📈 Header Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#0E4B32", fontSize: "26px", margin: 0 }}>📊 Admin Revenue Dashboard</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/admin/products/create" style={{ background: "#059669", color: "#fff", padding: "12px 20px", borderRadius: "6px", fontWeight: "bold", textDecoration: "none" }}>
            + Create Product
          </Link>        
          <button onClick={handleExportPDF} style={{ padding: "12px 20px", background: "#0E4B32", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            📄 Export PDF Report
          </button>
        </div>
      </div>

      {/* 🗂️ Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "35px" }}>
        <Card title="Total Revenue" value={`USD ${stats.revenue ?? stats.totalRevenue ?? 0}`} />
        <Card title="Total Orders" value={stats.orders ?? stats.totalOrders ?? 0} />
        <Card title="Customers" value={stats.customers ?? stats.totalCustomers ?? 0} />
        <Card title="Delivered Orders" value={stats.delivered ?? stats.deliveredOrders ?? 0} />
      </div>

      {/* 🧱 Two-Column Layout Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
        
        {/* Left Panel */}
        <div>
          <div style={{ marginBottom: "30px" }}>
            <RevenueChart data={monthlySales} darkMode={false} />
          </div>

          <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", marginBottom: "30px", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2d3748" }}>🏆 Top Selling Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#2d3748" }}>Recent Orders</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #edf2f7" }}>
                  <th style={{ padding: "12px 8px", color: "#718096", fontWeight: "600" }}>Order ID</th>
                  <th style={{ padding: "12px 8px", color: "#718096", fontWeight: "600" }}>Customer</th>
                  <th style={{ padding: "12px 8px", color: "#718096", fontWeight: "600" }}>Total</th>
                  <th style={{ padding: "12px 8px", color: "#718096", fontWeight: "600" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((order: any) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                      <td style={{ padding: "14px 8px", fontSize: "14px", color: "#2b6cb0", fontWeight: "500" }}>#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td style={{ padding: "14px 8px", fontSize: "14px", color: "#4a5568" }}>{order.user?.fullName || "Guest Customer"}</td>
                      <td style={{ padding: "14px 8px", fontSize: "14px", fontWeight: "bold" }}>USD {order.totalFinal}</td>
                      <td style={{ padding: "14px 8px" }}>
                        <span style={{ background: order.status === "DELIVERED" ? "#e6fffa" : "#fffaf0", color: order.status === "DELIVERED" ? "#319795" : "#dd6b20", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "#718096" }}>No recent orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#2d3748" }}>🏆 Top Selling Items</h3>
            {topAnalytics?.topProducts?.length > 0 ? (
              <ol style={{ paddingLeft: "20px", margin: 0, lineHeight: "2.5", color: "#4a5568" }}>
                {topAnalytics.topProducts.map((item: any, idx: number) => (
                  <li key={item.productVariantId || idx}>
                    Variant ID: {item.productVariantId?.slice(0, 8) || "Unknown"} 
                    <span style={{ color: "#718096", fontSize: "13px" }}> ({item._sum?.quantity || 0} sales)</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p style={{ color: "#718096", fontSize: "14px" }}>No data available.</p>
            )}
          </div>

          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#2d3748" }}>👥 Top Customers</h3>
            {topAnalytics?.topCustomers?.length > 0 ? (
              topAnalytics.topCustomers.map((customer: any) => {
                const totalSpent = customer.orders?.reduce((sum: number, o: any) => sum + (o.totalFinal || 0), 0) || 0;
                return (
                  <div key={customer.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #edf2f7", paddingBottom: "10px", marginBottom: "10px" }}>
                    <div><strong>{customer.fullName || "Unnamed"}</strong></div>
                    <div style={{ color: "#0E4B32", fontWeight: "bold" }}>USD {totalSpent}</div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#718096", fontSize: "14px" }}>No data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}