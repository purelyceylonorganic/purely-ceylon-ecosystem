import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { orderService } from "../../services/order.service";
import OrderTimeline from "../../components/orders/OrderTimeline";
import { paymentService } from "../../services/payment.service";
import api from "../../api/axios";

// 1. Material UI Components Import for Void Dialog
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from "@mui/material";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tracking ID-க்கான State
  const [trackingInput, setTrackingInput] = useState("");
  const [updatingShipping, setUpdatingShipping] = useState(false);

  // 💳 POS Payment-க்கான States
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amount, setAmount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);

// ==========================================
// 🔄 Reverse Payment
// ==========================================

const [showReverseDialog, setShowReverseDialog] = useState(false);
const [reverseReason, setReverseReason] = useState("");
const [reverseLoading, setReverseLoading] = useState(false);
const [selectedReversePaymentId, setSelectedReversePaymentId] = useState("");


  // ===============================
// Refund Dialog
// ===============================

const [showRefundDialog, setShowRefundDialog] =
  useState(false);

const [refundAmount, setRefundAmount] =
  useState("");

const [refundReason, setRefundReason] =
  useState("");

const [selectedPaymentId, setSelectedPaymentId] =
  useState("");

const [refundLoading, setRefundLoading] =
  useState(false);

  // 🧾 Checkout Success Dialog State
  const [showSuccessDialog ] = useState(false);

  // 🛑 Void Payment States & Loading State
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidLoading, setVoidLoading] = useState(false);


  // Total வந்தவுடன் Amount Auto Fill ஆகும் useEffect
  useEffect(() => {
    if (order) {
      const balanceAmount = order.balance !== undefined ? order.balance : (order.totalFinal || order.grandTotal || 0);
      setAmount(balanceAmount);
    }
  }, [order]);

  async function loadOrder(orderId?: string) {

    const targetId = orderId || id;
    if (!targetId) return;
    try {
      const response = await orderService.getOrderDetails(targetId);
      const fetchedOrder = response.order || response;
      setOrder(fetchedOrder);
      setTrackingInput(fetchedOrder.trackingId || "");
      
      const history = await paymentService.getPaymentHistory(targetId);
      setPayments(history.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
  if (id) {
    void loadOrder(id);
  } else {
    setLoading(false);
  }
}, [id]);

  async function changeStatus(orderId: string, status: string) {
  try {
    await orderService.updateOrderStatus(orderId, status);

    alert("Status Updated Successfully");

    // Backend-லிருந்து latest order status-ஐ மீண்டும் பெறும்
    await loadOrder(orderId);
  } catch (error) {
    console.error("Failed to update order status:", error);
    alert("Failed to update status");
  }
}

  // 🛑 handleVoidPayment Function
  const handleVoidPayment = async () => {
    try {
      if (!selectedPayment) return;

      setVoidLoading(true);

      await paymentService.voidPayment(
        selectedPayment.id,
        voidReason
      );

      alert("Payment voided successfully.");

      setVoidDialogOpen(false);
      setVoidReason("");
      setSelectedPayment(null);

      // Refresh Order & History
      await loadOrder();

    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        "Failed to void payment"
      );
    } finally {
      setVoidLoading(false);
    }
  };

  const handleRefund = async () => {

  if (!selectedPaymentId) {
    return;
  }

  if (!refundAmount) {
    alert("Enter refund amount");
    return;
  }

  if (!refundReason.trim()) {
    alert("Enter refund reason");
    return;
  }

  try {

    setRefundLoading(true);

    await paymentService.refundPayment(
      selectedPaymentId,
      Number(refundAmount),
      refundReason
    );

    alert("Refund completed successfully");

    setShowRefundDialog(false);

    setRefundAmount("");

    setRefundReason("");

    loadOrder();

  } catch (error: any) {

    alert(
      error.response?.data?.message ||
      "Refund failed"
    );

  } finally {

    setRefundLoading(false);

  }

}; 

const handleReverse = async () => {
  try {
    if (!selectedReversePaymentId) {
      alert("Please select a payment.");
      return;
    }

    if (!reverseReason.trim()) {
      alert("Reverse reason is required.");
      return;
    }

    setReverseLoading(true);

    await paymentService.reversePayment(
      selectedReversePaymentId,
      reverseReason
    );

    alert("Payment Reversed Successfully.");

    setShowReverseDialog(false);
    setReverseReason("");
    setSelectedReversePaymentId("");

    await loadOrder();

  } catch (err: any) {

    alert(err?.response?.data?.message || err.message);

  } finally {

    setReverseLoading(false);

  }
};


  // ✅ Safe Fetch PDF Download
const downloadInvoice = async () => {
  try {
    const response = await api.get(
      `/orders/${order.id}/invoice`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `invoice-${order.id}.pdf`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("Invoice download error:", error);

    alert(
      error?.response?.data?.message ||
        "Invoice download failed"
    );
  }
}; 

  // 💳 Handle Payment Function (POS Payment)
  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      await paymentService.createPayment({
        orderId: id!,
        amount,
        gateway: paymentMethod,
        paymentMethod,
      });

      alert("Payment Completed Successfully!");
      loadOrder(id!);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Payment Failed");
    } finally {
      setProcessing(false);
    }
  };

 // ✅ Confirm Order Handler
const handleConfirm = async () => {
  try {
    setConfirming(true);

    await paymentService.confirmOrder(order.id);

    alert("Order Confirmed");

    navigate("/admin/customers", {
      replace: true,
    });

  } catch (e) {
    console.error(e);
    alert("Unable to confirm");
  } finally {
    setConfirming(false);
  }
};

  // 🚛 Shipping Details Update Function
  const handleShippingUpdate = async (updatedStatus: string, updatedTracking: string) => {
    setUpdatingShipping(true);
    try {
      await api.put(`/orders/${order.id}/shipping`, {
  shippingStatus: updatedStatus,
  trackingId: updatedTracking,
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
  const paidAmount =
    order.paidAmount ??
    (Array.isArray(payments)
      ? payments.reduce((acc, curr) => acc + (curr.amount || 0), 0)
      : 0);
    
  const balanceAmount = order.balance !== undefined ? order.balance : Math.max(0, (order.totalFinal || order.grandTotal || 0) - paidAmount);

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 px-3 py-5 font-sans sm:px-5 sm:py-8 lg:px-8">

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
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* 🛡️ Confirm Order Button */}
            <button
              onClick={handleConfirm}
              disabled={order.paymentStatus !== "PAID" || confirming}
              style={{
                background: order.paymentStatus === "PAID" ? "#0E4B32" : "#cbd5e0",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "6px",
                cursor: order.paymentStatus === "PAID" ? "pointer" : "not-allowed",
                fontWeight: "bold",
                boxShadow: order.paymentStatus === "PAID" ? "0 2px 5px rgba(14, 75, 50, 0.2)" : "none",
              }}
            >
              {confirming ? "Confirming..." : "Confirm Order"}
            </button>

            {/* 📄 Print / Download Invoice Button */}
            {order.paymentStatus === "PAID" && (
              <button
                onClick={() => {
                  navigate(`/admin/orders/${order.id}/invoice`);
                }}
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
                Print Invoice
              </button>
            )}

            {/* 📄 PDF Download Button */}
            <button
              onClick={downloadInvoice}
              style={{
                background: "#2b6cb0",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 2px 5px rgba(43, 108, 176, 0.2)",
              }}
            >
              📄 Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* 🗂️ பிரதான கிரிட் லேஅவுட் */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[1.7fr_1.3fr] lg:gap-7">
        
        {/* 📑 இடது பக்கம்: விவரங்கள், டைம்லைன் மற்றும் ஷிப்பிங் */}
        <div className="flex flex-col gap-6">
          
          {/* ஆர்டர் சுருக்கம் கார்டு */}
          <div className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-green-800 border-b border-gray-200 pb-2">Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p className="m-0"><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "7/8/2026, 4:36:52 PM"}</p>
              <p className="m-0"><strong>Payment Status:</strong> <span className={`font-bold ${order.paymentStatus === "PAID" ? "text-green-600" : "text-red-600"}`}>{order.paymentStatus || "UNPAID"}</span></p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-base font-semibold text-gray-600">Grand Total</span>
              <span style={{ fontSize: "22px", color: "#0E4B32", fontWeight: "bold" }}>LKR {order.totalFinal || order.grandTotal || "2950"}</span>
            </div>
          </div>

          {/* 💳 Payment Summary Box */}
          <div className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-green-800 border-b border-gray-200 pb-2">Payment Summary</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span style={{ color: order.paymentStatus === "PAID" ? "#28a745" : "#dc3545", fontWeight: "bold" }}>
                  {order.paymentStatus === "PAID" ? "🟢 PAID" : `🔴 ${order.paymentStatus || "UNPAID"}`}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Paid</span>
                <strong style={{ color: "#0E4B32" }}>LKR {paidAmount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Balance</span>
                <strong>{balanceAmount.toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Transaction</span>
                <span style={{ fontFamily: "monospace", color: "#555" }}>
                  {payments.length > 0 ? `${payments[payments.length - 1].paymentMethod}-${new Date(payments[payments.length - 1].createdAt).toISOString().slice(0,10).replace(/-/g,'')}-${payments[payments.length - 1].id.slice(0,5).toUpperCase()}` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* 💳 POS Payment Card */}
          <div style={{ border: "1px solid #eef2f5", padding: "25px", borderRadius: "12px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#0E4B32", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px" }}>POS Payment</h3>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#4a5568" }}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0", backgroundColor: "#fff", fontSize: "14px", outline: "none" }}
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="PAYHERE">PayHere</option>
                <option value="STRIPE">Stripe</option>
              </select>
            </div>
            <div style={{ marginTop: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#4a5568" }}>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0", backgroundColor: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <button
              onClick={handlePayment}
              disabled={processing}
              style={{ width: "100%", marginTop: "20px", padding: "12px", background: "#0E4B32", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}
            >
              {processing ? "Processing..." : "Collect Payment"}
            </button>

            {/* Payment History Section with Table, Status & Void/Refund Buttons */}
<div style={{ marginTop: 25 }}>
  <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#0E4B32" }}>Payment History</h4>
  {payments.length === 0 ? (
    <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>No Payments</p>
  ) : (
    <div className="w-full overflow-x-auto">
  <table className="w-full min-w-[650px] border-collapse text-sm">
        <thead>
          <tr style={{ borderBottom: "2px solid #eee", textAlign: "left", color: "#555" }}>
            <th style={{ padding: "8px" }}>Method</th>
            <th style={{ padding: "8px" }}>Amount</th>
            <th style={{ padding: "8px" }}>Status</th>
            <th style={{ padding: "8px" }}>Date</th>
            <th style={{ padding: "8px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{payment.paymentMethod}</td>
              <td style={{ padding: "8px" }}>LKR {payment.amount}</td>
              <td style={{ padding: "8px", fontWeight: "bold", color: payment.paymentStatus === "VOID" ? "#dc3545" : "#28a745" }}>
                {payment.paymentStatus || "PAID"}
              </td>
              <td style={{ padding: "8px", color: "#666", fontSize: "12px" }}>
                {new Date(payment.createdAt).toLocaleString()}
              </td>
              
              {/* 🌟 Action Column (Void & Refund Buttons) */}
              <td style={{ padding: "8px", display: "flex", gap: "6px" }}>

  {/* Void Button */}
  {payment.paymentStatus !== "VOID" &&
    payment.paymentStatus !== "REFUNDED" && (
      <button
        onClick={() => {
          setSelectedPayment(payment);
          setVoidReason("");
          setVoidDialogOpen(true);
        }}
        style={{
          background: "#dc3545",
          color: "#fff",
          border: "none",
          padding: "6px 10px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        Void
      </button>
    )}

  {/* Refund Button */}
  {payment.paymentStatus === "PAID" && (
    <button
      onClick={() => {
        setSelectedPaymentId(payment.id);
        setRefundAmount(payment.amount.toString());
        setRefundReason("");
        setShowRefundDialog(true);
      }}
      style={{
        background: "#f59e0b",
        color: "#fff",
        border: "none",
        padding: "6px 10px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
      }}
    >
      Refund
    </button>
  )}

     {/* Reverse Button */}
  <Button
  variant="contained"
  color="secondary"
  size="small"
  onClick={() => {
    setSelectedReversePaymentId(payment.id);
    setShowReverseDialog(true);
  }}
>
  Reverse
</Button>

</td>
                        </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
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
                      Qty: {item.quantity} x LKR {item.price}
                    </p>
                  </div>
                  <p style={{ margin: "0", fontWeight: "bold", color: "#0E4B32", fontSize: "16px" }}>
                    LKR {item.quantity * item.price}
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
                  <option value="PENDING">
PENDING
</option>

<option value="PACKED">
PACKED
</option>

<option value="SHIPPED">
SHIPPED
</option>

<option value="IN_TRANSIT">
IN TRANSIT
</option>

<option value="OUT_FOR_DELIVERY">
OUT FOR DELIVERY
</option>

<option value="DELIVERED">
DELIVERED
</option>

                </select>
              </div>

              {/* Tracking ID Input Field */}
<div className="w-full min-w-0">
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Tracking ID
  </label>

  <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
    <input
      type="text"
      placeholder="Enter Tracking ID"
      value={trackingInput}
      onChange={(e) => setTrackingInput(e.target.value)}
      className="w-full min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-500"
    />

    <button
      type="button"
      onClick={() =>
        handleShippingUpdate(
          order.shippingStatus || "PENDING",
          trackingInput
        )
      }
      disabled={updatingShipping}
      className="w-full shrink-0 rounded-md bg-[#0E4B32] px-4 py-2 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
  onChange={(e) => changeStatus(order.id, e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e0",
    backgroundColor: "#fff",
    fontWeight: "600",
    color: "#0E4B32",
    outline: "none",
    cursor: "pointer",
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

      {/* 🚀 Checkout Success Dialog Modal */}
      {showSuccessDialog && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>✔</div>
            <h3 style={{ margin: "0 0 5px 0", color: "#0E4B32", fontSize: "20px" }}>Order Completed</h3>
            <p style={{ color: "#666", margin: "0 0 25px 0", fontSize: "14px" }}>Invoice Ready</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => {
                  navigate(`/admin/orders/${order.id}/invoice`);
                }}
                style={{
                  padding: "12px",
                  background: "#0E4B32",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "15px"
                }}
              >
                Print Invoice
              </button>
              <button
                onClick={() => navigate("/admin/orders/new")}
                style={{
                  padding: "12px",
                  background: "#f8f9fa",
                  color: "#0E4B32",
                  border: "1px solid #0E4B32",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "15px"
                }}
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛑 Void Payment Dialog Modal */}
      <Dialog
        open={voidDialogOpen}
        onClose={() => {
          if (voidLoading) return;
          setVoidDialogOpen(false);
          setVoidReason("");
          setSelectedPayment(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Void Payment</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Reason"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            multiline
            rows={3}
            placeholder="Why are you voiding this payment?"
          />
        </DialogContent>

        <DialogActions>
          <Button
            disabled={voidLoading}
            onClick={() => {
              setVoidDialogOpen(false);
              setVoidReason("");
              setSelectedPayment(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={voidLoading}
            onClick={handleVoidPayment}
          >
            {voidLoading ? "Voiding..." : "Confirm Void"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔄 Refund Dialog Modal */}
      <Dialog
        open={showRefundDialog}
        onClose={() => {
          if (refundLoading) return;
          setShowRefundDialog(false);
          setRefundAmount("");
          setRefundReason("");
          setSelectedPaymentId("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Refund Payment</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            type="number"
            margin="normal"
            label="Refund Amount"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Reason"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            multiline
            rows={3}
            placeholder="Why are you refunding this payment?"
          />
        </DialogContent>

        <DialogActions>
          <Button
            disabled={refundLoading}
            onClick={() => {
              setShowRefundDialog(false);
              setRefundAmount("");
              setRefundReason("");
              setSelectedPaymentId("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={refundLoading}
            onClick={handleRefund}
          >
            {refundLoading ? "Processing..." : "Confirm Refund"}
          </Button>
        </DialogActions>
      </Dialog>


{/* ==========================================
   Reverse Payment Dialog
========================================== */}

<Dialog
  open={showReverseDialog}
  onClose={() => {
    if (reverseLoading) return;

    setShowReverseDialog(false);
    setReverseReason("");
    setSelectedReversePaymentId("");
  }}
  maxWidth="sm"
  fullWidth
>

  <DialogTitle>
    Reverse Payment
  </DialogTitle>

  <DialogContent>

    <TextField
      fullWidth
      margin="normal"
      label="Reason"
      multiline
      rows={3}
      value={reverseReason}
      onChange={(e) => setReverseReason(e.target.value)}
    />

  </DialogContent>

  <DialogActions>

    <Button
      onClick={() => {
        setShowReverseDialog(false);
        setReverseReason("");
        setSelectedReversePaymentId("");
      }}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      color="secondary"
      disabled={reverseLoading}
      onClick={handleReverse}
    >
      {reverseLoading ? "Processing..." : "Reverse"}
    </Button>

  </DialogActions>

</Dialog>
    </div>
    </div>
  );
}