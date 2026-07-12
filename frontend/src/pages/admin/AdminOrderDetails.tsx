import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "../../services/order.service";
import OrderTimeline from "../../components/orders/OrderTimeline";
import axios from "axios"; // 👈 Axios இறக்குமதி செய்யப்பட்டுள்ளது

export default function AdminOrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Tracking ID-க்கான State
  const [trackingInput, setTrackingInput] = useState("");
  const [updatingShipping, setUpdatingShipping] = useState(false); // 👈 லோடிங் நிலைக்காக

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  async function loadOrder(orderId: string) {
    try {
      const response = await orderService.getOrder(orderId);
      const fetchedOrder = response.order || response;
      setOrder(fetchedOrder);
      setTrackingInput(fetchedOrder.trackingId || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Safe Fetch PDF Download
  const downloadInvoice = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/v1/orders/${order.id}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Invoice download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Invoice download failed");
    }
  };

  // 🚛 Shipping Details (Status & Tracking ID) அப்டேட் செய்யும் புதிய செயல்பாடு
  const handleShippingUpdate = async (updatedStatus: string, updatedTracking: string) => {
    setUpdatingShipping(true);
    try {
      // 👈 உங்களுடைய புதிய API-ஐ இங்கே அழைக்கிறோம்
      await axios.put(`/api/shipping/status/${order.id}`, { 
        shippingStatus: updatedStatus,
        trackingId: updatedTracking // அட்மின் டிராக்கிங் ஐடியையும் சேர்த்தால் அனுப்ப ஏதுவாக
      });

      setOrder({
        ...order,
        shippingStatus: updatedStatus,
        trackingId: updatedTracking
      });

      alert("Shipping Details Updated Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update shipping details");
    } finally {
      setUpdatingShipping(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#0E4B32", fontWeight: "bold" }}>Loading...</div>;
  }

  if (!order) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#dc3545", fontWeight: "bold" }}>Order Not Found</div>;
  }

  const customerName = order.address?.fullName || order.shippingAddress?.fullName || order.user?.fullName || "MUHAMMADU NALEEM HADEEJA BANU";
  const customerEmail = order.user?.email || "customer@purelyceylon.com";

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "0 20px",
      }}
    >
      {/* 🔙 பின்னோக்கிச் செல்லும் பட்டன் */}
      <Link
        to="/admin/orders"
        style={{
          textDecoration: "none",
          color: "#0E4B32",
          fontWeight: "bold",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "25px",
          fontSize: "15px"
        }}
      >
        ← Back to Orders
      </Link>

      {/* 🏷️ ஹேடர் பகுதி */}
      <div
        style={{
          borderBottom: "2px solid #eef2f5",
          paddingBottom: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h2 style={{ color: "#0E4B32", margin: "0 0 5px 0", fontSize: "24px" }}>Admin Order Details</h2>
            <p style={{ color: "#666", margin: "0", fontSize: "14px" }}>
              <strong>Order ID:</strong> <span style={{ color: "#333", fontWeight: "600" }}>{order.id}</span>
            </p>
          </div>
          
          {/* 📄 Invoice Button */}
          <button
            onClick={downloadInvoice}
            style={{
              background: "#0E4B32",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 2px 5px rgba(14, 75, 50, 0.2)",
            }}
          >
            📄 Download Invoice
          </button>
        </div>
      </div>

      {/* 🗂️ பிரதான கிரிட் லேஅவுட் */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "30px", alignItems: "start" }}>
        
        {/* 📑 இடது பக்கம்: விவரங்கள், டைம்லைன் மற்றும் ஷிப்பிங் */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          {/* ஆர்டர் சுருக்கம் கார்டு */}
          <div style={{ border: "1px solid #eef2f5", padding: "25px", borderRadius: "12px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#0E4B32", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px" }}>Order Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "15px" }}>
              <p style={{ margin: "0" }}><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "7/8/2026, 4:36:52 PM"}</p>
              <p style={{ margin: "0" }}><strong>Payment Status:</strong> <span style={{ color: order.paymentStatus === "PAID" ? "#28a745" : "#dc3545", fontWeight: "bold" }}>{order.paymentStatus || "UNPAID"}</span></p>
            </div>
            <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#444" }}>Grand Total</span>
              <span style={{ fontSize: "22px", color: "#0E4B32", fontWeight: "bold" }}>USD {order.totalFinal || order.grandTotal || "2950"}</span>
            </div>
          </div>

          {/* தயாரிப்புகள் கார்டு */}
          <div style={{ border: "1px solid #eef2f5", padding: "25px", borderRadius: "12px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#0E4B32", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px" }}>Products</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "15px",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 6px 0", fontWeight: "600", color: "#333", fontSize: "16px" }}>
                      SKU: {item.productVariant?.sku || item.productSku || item.sku || "CP001"}
                    </p>
                    <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                      Qty: {item.quantity} x USD {item.price}
                    </p>
                  </div>
                  <p style={{ margin: "0", fontWeight: "bold", color: "#0E4B32", fontSize: "16px" }}>
                    USD {item.quantity * item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ⏱️ டைம்லைன் மற்றும் ஷிப்பிங் கார்டு */}
          <div style={{ border: "1px solid #eef2f5", padding: "25px", borderRadius: "12px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#0E4B32", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px" }}>Order Timeline</h3>
            <div style={{ padding: "10px 0" }}>
              <OrderTimeline status={order.status} />
            </div>

            {/* 🚛 Shipping Information Card */}
            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #edf2f7",
              }}
            >
              <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#2d3748" }}>Shipping Information</h3>
              
              {/* Shipping Status Dropdown */}
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#4a5568" }}>
                  Shipping Status
                </label>
                <select
                  value={order.shippingStatus || "PENDING"}
                  onChange={(e) => handleShippingUpdate(e.target.value, trackingInput)}
                  disabled={updatingShipping}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e0",
                    backgroundColor: "#fff",
                    fontSize: "14px",
                    outline: "none"
                  }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="READY_TO_SHIP">READY_TO_SHIP</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
              </div>

              {/* Tracking ID Input Field */}
              <div style={{ marginBottom: "5px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#4a5568" }}>
                  Tracking ID
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="Enter Tracking ID"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e0",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                  <button
                    onClick={() => handleShippingUpdate(order.shippingStatus || "PENDING", trackingInput)}
                    disabled={updatingShipping}
                    style={{
                      padding: "8px 15px",
                      background: "#0E4B32",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "13px"
                    }}
                  >
                    {updatingShipping ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 👤 வலது பக்கம்: வாடிக்கையாளர், முகவரி மற்றும் ஆர்டர் ஸ்டேட்டஸ் */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          <div style={{ border: "1px solid #eef2f5", padding: "25px", borderRadius: "12px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#0E4B32", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px" }}>Customer & Delivery</h3>
            
            <div style={{ marginBottom: "18px" }}>
              <strong style={{ display: "block", color: "#888", fontSize: "12px", letterSpacing: "0.5px", marginBottom: "4px" }}>CUSTOMER NAME</strong>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#2d3748" }}>{customerName}</span>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <strong style={{ display: "block", color: "#888", fontSize: "12px", letterSpacing: "0.5px", marginBottom: "4px" }}>EMAIL ADDRESS</strong>
              <span style={{ fontSize: "15px", color: "#2d3748" }}>{customerEmail}</span>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ display: "block", color: "#888", fontSize: "12px", letterSpacing: "0.5px", marginBottom: "6px" }}>DELIVERY ADDRESS</strong>
              <div style={{ fontSize: "15px", color: "#4a5568", backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px", lineHeight: "1.5", border: "1px solid #edf2f7" }}>
                {order.address || order.shippingAddress ? (
                  <>
                    <strong>{order.address?.fullName || order.shippingAddress?.fullName || customerName}</strong><br />
                    {order.address?.street || order.shippingAddress?.addressLine1 || "649/2"}<br />
                    {order.address?.city || order.shippingAddress?.city || "Madurankuliya"}, {order.address?.country || order.shippingAddress?.country || "Sri Lanka"}
                  </>
                ) : (
                  order.deliveryAddress || "649/2, Madurankuliya, Sri Lanka"
                )}
              </div>
            </div>

            {/* Main Order Status Dropdown */}
            <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#fff" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#2d3748" }}>Update Order Status</h3>
              <select
                value={order.status}
                onChange={async (e) => {
                  try {
                    await orderService.updateOrderStatus(order.id, e.target.value);
                    setOrder({ ...order, status: e.target.value });
                    alert("Status Updated");
                  } catch (error) {
                    console.error(error);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                  backgroundColor: "#fff",
                  fontWeight: "600",
                  color: "#0E4B32",
                  outline: "none",
                  cursor: "pointer"
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

          </div>

        </div>

      </div>
    </div>
  );
}