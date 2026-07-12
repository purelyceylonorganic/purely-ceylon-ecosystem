import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../../services/order.service";
import DeliveryTimeline from "../../components/orders/DeliveryTimeline";

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ⏱️ Step 6 & 8: 10 வினாடிக்கு ஒருமுறை ஆட்டோ ரெஃப்ரெஷ் செய்யும் லாஜிக் இணைக்கப்பட்ட useEffect
  useEffect(() => {
    if (id) {
      loadOrder(id); // முதலில் பக்கத்திற்கு வரும்போது ஒருமுறை அழைக்கும்

      const interval = setInterval(() => {
        // பக்கத்தில் லோடிங் ஸ்பின்னர் காட்டாமல் பின்னணியில் மட்டும் தரவை புதுப்பிக்க
        // loadOrder(id) நேரடியாக அழைக்கப்படுகிறது
        loadOrder(id); 
      }, 10000); 

      return () => clearInterval(interval); // பக்கத்தை விட்டு வெளியேறும்போது இன்டர்வெல் கிளீனப் செய்யப்படும்
    }
  }, [id]);

  async function loadOrder(orderId: string) {
    try {
      const response = await orderService.getOrder(orderId);
      setOrder(response.order || response.data || response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ color: "#0E4B32", fontWeight: "600", fontSize: "18px" }}>Loading tracking status...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ color: "#dc3545", fontWeight: "600", fontSize: "18px" }}>Order Not Found</div>
        <button 
          onClick={() => navigate("/orders")} 
          style={{ marginTop: "15px", background: "#0E4B32", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // 🟢 அசல் செங்குத்து டைம்லைன் நிலைகள்
  const steps = [
    "PENDING",
    "READY_TO_SHIP",
    "SHIPPED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const currentStep = steps.indexOf(order.shippingStatus || "PENDING");

  return (
    <div
      style={{
        maxWidth: "1140px",
        margin: "30px auto",
        padding: "0 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#fcfbf7" 
      }}
    >
      {/* 🧭 Top Navigation Breadcrumb */}
      <div style={{ marginBottom: "20px", fontSize: "14px", color: "#6b7280" }}>
        <span style={{ cursor: "pointer", color: "#0E4B32", fontWeight: "500" }} onClick={() => navigate("/orders")}>My Orders</span>
        <span style={{ margin: "0 8px" }}>/</span>
        <span>Track Order</span>
      </div>

      {/* 📦 Header Container */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "15px", marginBottom: "25px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "600", color: "#111827" }}>
            Track Your Order #{order.id?.slice(-6).toUpperCase()}
          </h2>
          <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#6b7280", letterSpacing: "0.3px" }}>
            Order ID: <span style={{ color: "#374151", fontWeight: "600" }}>{order.id}</span>
          </p>
        </div>
        <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", letterSpacing: "0.5px" }}>
          {order.shippingStatus || "PENDING"}
        </span>
      </div>

      {/* 🚚 1. Top Section: Horizontal Progress Bar */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px", marginBottom: "30px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <DeliveryTimeline status={order.shippingStatus || "PENDING"} />
      </div>

      {/* 📊 2. Bottom Section: 2-Column Split Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "30px", alignItems: "start" }}>
        
        {/* 🟢 LEFT COLUMN: Live Shipment Progress Logs */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 25px 0", fontSize: "16px", fontWeight: "600", color: "#111827" }}>
            Live Shipment Progress Logs
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "25px", position: "relative", paddingLeft: "35px" }}>
            {/* செங்குத்து கோடு */}
            <div
              style={{
                position: "absolute",
                left: "11px",
                top: "12px",
                bottom: "12px",
                width: "2px",
                background: "#e2e8f0",
              }}
            />

            {steps.map((step, idx) => {
              const completed = idx <= currentStep;

              return (
                <div key={step} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  {/* டிக் மார்க் வட்டம் */}
                  <div
                    style={{
                      position: "absolute",
                      left: "-35px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: completed ? "#28a745" : "#e2e8f0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "bold",
                      zIndex: 2,
                    }}
                  >
                    {completed ? "✓" : ""}
                  </div>

                  {/* நிலை உரை */}
                  <span
                    style={{
                      color: completed ? "#28a745" : "#a0aec0",
                      fontWeight: "bold",
                      fontSize: "14px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {step.replace(/_/g, " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🗺️ RIGHT COLUMN: Shipment Overview & Delivery Address */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          
          {/* Shipment Details Card */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "600", color: "#111827" }}>
              Shipment Overview
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "600", marginBottom: "2px" }}>Tracking Number</label>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>{order.trackingId || "Not Assigned"}</span>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "600", marginBottom: "2px" }}>Payment Method</label>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>{order.paymentMethod || "CARD"}</span>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "600", marginBottom: "2px" }}>Total Amount</label>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#0E4B32" }}>{order.currency || "USD"} {order.totalFinal}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: "600", color: "#111827", display: "flex", alignItems: "center", gap: "6px" }}>
              📍 Delivery Address
            </h3>
            <div style={{ color: "#4b5563", lineHeight: "1.6", fontSize: "14px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
              <p style={{ margin: "0 0 6px 0", fontWeight: "600", color: "#111827", fontSize: "15px" }}>
                {order.address?.fullName || "MUHAMMADU NALEEM HADEEJA BANU"}
              </p>
              <p style={{ margin: "0 0 4px 0" }}>{order.address?.street || "649/2"}</p>
              <p style={{ margin: "0 0 4px 0" }}>{order.address?.city || "Madurankuliya"}</p>
              <p style={{ margin: "0", fontWeight: "500", color: "#111827" }}>{order.address?.country || "Sri Lanka"}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}