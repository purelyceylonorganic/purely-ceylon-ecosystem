import { useEffect, useState } from "react";
import { orderService } from "../../services/order.service";
import { Link } from "react-router-dom";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  // ✅ அட்மினுக்கான பிரத்யேக getAllOrders() ஏபிஐ அழைப்பு
  async function loadOrders() {
    try {
      const response = await orderService.getAllOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function changeStatus(orderId: string, status: string) {
    try {
      await orderService.updateOrderStatus(orderId, status);
      alert("Status Updated Successfully");
      loadOrders();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "0 20px",
      }}
    >
      <h2 style={{ color: "#0E4B32", marginBottom: "20px" }}>Admin Orders Management</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>Total Orders: {orders.length}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #eef2f5",
              padding: "25px",
              borderRadius: "12px",
              backgroundColor: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            {/* Left Section: Order & Customer Info */}
            <div style={{ flex: "1", minWidth: "280px" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#888" }}>
                <strong>Order ID:</strong> <span style={{ color: "#333", fontWeight: "600" }}>{order.id}</span>
              </p>
              
              {/* ✅ வாடிக்கையாளர் பெயர் */}
              <p style={{ margin: "0 0 6px 0", fontSize: "15px", color: "#444" }}>
                <strong>Customer:</strong> {order.user?.fullName || "Unknown Customer"}
              </p>

              {/* ✅ ஆர்டர் செய்யப்பட்ட தேதி */}
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#666" }}>
                <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
              </p>

              <p style={{ margin: "0 0 12px 0", fontSize: "18px" }}>
                <strong>Total:</strong> <span style={{ color: "#0E4B32", fontWeight: "bold" }}>USD {order.totalFinal}</span>
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}>Status:</span>
                {/* ✅ புதிய வண்ணங்களுடன் கூடிய ஸ்டேட்டஸ் பேட்ஜ் */}
                <span
                  style={{
                    background:
                      order.status === "DELIVERED"
                        ? "#0E4B32"
                        : order.status === "SHIPPED"
                        ? "#007bff"
                        : order.status === "PROCESSING" || order.status === "PACKED"
                        ? "#17a2b8"
                        : order.status === "CONFIRMED"
                        ? "#28a745"
                        : order.status === "PENDING"
                        ? "#ffc107"
                        : order.status === "CANCELLED"
                        ? "#dc3545"
                        : "#6c757d",
                    color: order.status === "PENDING" ? "#000" : "#fff",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    letterSpacing: "0.5px"
                  }}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Right Section: Actions (Change Status & View) */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#777", marginBottom: "5px", fontWeight: "bold" }}>
                  CHANGE STATUS
                </label>
                <select
                  onChange={(e) => changeStatus(order.id, e.target.value)}
                  value={order.status}
                  style={{
                    padding: "10px 15px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f9f9f9",
                    cursor: "pointer",
                    fontSize: "14px",
                    outline: "none",
                  }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* View Details Link for Admin */}
              <div style={{ alignSelf: "flex-end" }}>
                {/* ✅ அட்மினுக்குரிய பிரத்யேக ரூட் லிங்க் சரியாக மாற்றப்பட்டுள்ளது */}
                <Link
                  to={`/admin/orders/${order.id}`}
                  style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    background: "#fff",
                    color: "#0E4B32",
                    border: "2px solid #0E4B32",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  👁️ View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}