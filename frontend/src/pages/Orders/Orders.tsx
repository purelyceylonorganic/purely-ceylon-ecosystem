import { useEffect, useState } from "react";
import { orderService } from "../../services/order.service";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const response = await orderService.getMyOrders();
      setOrders(response.orders || response.data || response || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // அழகிய ஸ்டேட்டஸ் வண்ணங்கள் (Dynamic Status Styling)
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return { bg: "#e6f4ea", text: "#137333" };
      case "PENDING":
        return { bg: "#fef7e0", text: "#b06000" };
      case "SHIPPED":
        return { bg: "#e8f0fe", text: "#1a73e8" };
      case "PROCESSING":
        return { bg: "#e0f2fe", text: "#0369a1" };
      default:
        return { bg: "#f1f3f4", text: "#3c4043" };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "system-ui, sans-serif" }}>
        <h3 style={{ color: "#0E4B32", fontWeight: "600" }}>Loading Your Orders...</h3>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "system-ui, sans-serif" }}>
        <h3 style={{ color: "#4b5563", fontWeight: "500" }}>No Orders Found</h3>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "8px" }}>You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* பக்கத்தின் தலைப்பு */}
      <h2 style={{ color: "#0E4B32", marginBottom: "24px", fontWeight: "600", fontSize: "24px" }}>
        My Orders
      </h2>

      {/* தொழில்முறை அட்டை லேஅவுட் (Professional Table Container) */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "16px 24px", color: "#4b5563", fontWeight: "600", fontSize: "14px" }}>Order ID</th>
                <th style={{ padding: "16px", color: "#4b5563", fontWeight: "600", fontSize: "14px" }}>Items</th>
                <th style={{ padding: "16px", color: "#4b5563", fontWeight: "600", fontSize: "14px" }}>Total</th>
                <th style={{ padding: "16px", color: "#4b5563", fontWeight: "600", fontSize: "14px" }}>Payment</th>
                <th style={{ padding: "16px", color: "#4b5563", fontWeight: "600", fontSize: "14px" }}>Status</th>
                <th style={{ padding: "16px 24px", color: "#4b5563", fontWeight: "600", fontSize: "14px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusStyle = getStatusColor(order.status);
                // API-ல் இருந்து வரும் items array எண்ணிக்கையை பாதுகாப்பாக எடுக்கிறது
                const itemsCount = order.items ? order.items.length : 0;

                return (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Order ID & Sub info */}
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>
                      #{order.id?.slice(-8).toUpperCase()}
                      <span style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginTop: "2px", fontWeight: "normal" }}>
                        Full ID: {order.id?.slice(0, 8)}...
                      </span>
                    </td>

                    {/* Items Quantity */}
                    <td style={{ padding: "16px", fontSize: "14px", color: "#4b5563" }}>
                      {itemsCount} {itemsCount > 1 ? "Items" : "Item"}
                    </td>

                    {/* Total Final Price */}
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                      USD {order.totalFinal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Payment Status Badge */}
                    <td style={{ padding: "16px", fontSize: "14px" }}>
                      <span
                        style={{
                          color: order.paymentStatus?.toUpperCase() === "UNPAID" ? "#dc3545" : "#28a745",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Order Status Badge */}
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          display: "inline-block",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        style={{
                          background: "#0E4B32",
                          color: "#fff",
                          border: "none",
                          padding: "8px 18px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#0a3725")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#0E4B32")}
                      >
                        Track Order
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}