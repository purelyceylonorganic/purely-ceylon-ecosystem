import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { orderService } from "../../services/order.service";
import OrderTimeline from "../../components/orders/OrderTimeline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  async function loadOrder(orderId: string) {
    try {
      const response = await orderService.getOrder(orderId);
      setOrder(response.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Professional Invoice Generation Function
  function downloadInvoice() {
    if (!order) return;

    const doc = new jsPDF();

    // --- 1. Top Header Banner (Brand Color) ---
    doc.setFillColor(14, 75, 50); // #0E4B32 - Purely Ceylon Green
    doc.rect(0, 0, 210, 40, "F");

    // Company Name & Title inside Banner
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Purely Ceylon Organic (Pvt) Ltd", 14, 25);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(14);
    doc.text("OFFICIAL INVOICE", 150, 25);

    // --- 2. Invoice Details Section (Two-Column Layout) ---
    doc.setTextColor(51, 51, 51); // Dark Grey Text
    let y = 55;

    // Left Column: Order Metadata
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("INVOICE TO:", 14, y);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Order ID   : ${order.id}`, 14, y + 8);
    doc.text(`Date         : ${order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}`, 14, y + 16);
    doc.text(`Status       : ${order.status}`, 14, y + 24);
    doc.text(`Payment  : ${order.paymentStatus}`, 14, y + 32);

    // Right Column: Delivery Address
    if (order.address) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("DELIVERY ADDRESS:", 120, y);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(order.address.fullName || "", 120, y + 8);
      doc.text(order.address.street || "", 120, y + 16);
      doc.text(`${order.address.city || ""}, ${order.address.country || "Sri Lanka"}`, 120, y + 24);
    }

    // --- 3. Professional Products Table ---
    y += 45;
    
    autoTable(doc, {
      startY: y,
      head: [["SKU", "Weight", "Price", "Qty", "Subtotal"]],
      body:
        order.items?.map((item: any) => [
          item.productVariant?.sku || "N/A",
          item.productVariant?.weight || "N/A",
          `USD ${Number(item.price).toFixed(2)}`,
          item.quantity,
          `USD ${(item.price * item.quantity).toFixed(2)}`,
        ]) || [],
      theme: "striped",
      headStyles: {
        fillColor: [14, 75, 50], // Match Brand Green
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        font: "Helvetica",
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 35, halign: "right" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 45, halign: "right" },
      },
    });

    // --- 4. Grand Total Section ---
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Light green background box for Grand Total
    doc.setFillColor(240, 247, 244);
    doc.rect(110, finalY - 8, 86, 14, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(14, 75, 50);
    doc.text(`Grand Total: USD ${order.totalFinal ? Number(order.totalFinal).toFixed(2) : "0.00"}`, 115, finalY);

    // --- 5. Footer Message ---
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for your business with Purely Ceylon Organic!", 14, 285);

    // Save the PDF
    doc.save(`invoice-${order.id}.pdf`);
  }

  if (loading) {
    return <h2 style={{ textAlign: "center", marginTop: "40px" }}>Loading Order...</h2>;
  }

  if (!order) {
    return <h2 style={{ textAlign: "center", marginTop: "40px", color: "red" }}>Order Not Found</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }}
    >
      <h2 style={{ color: "#0E4B32", marginBottom: "20px" }}>Order Details</h2>
      <hr style={{ border: "0", height: "1px", background: "#eee", marginBottom: "20px" }} />

      {/* Order Info Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" }}>
        <div>
          <p style={{ margin: "5px 0" }}><strong>Order ID :</strong> <span style={{ fontSize: "14px", color: "#555" }}>{order.id}</span></p>
          <p style={{ margin: "5px 0" }}><strong>Order Date :</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</p>
          <p style={{ margin: "5px 0" }}><strong>Payment :</strong> {order.paymentStatus}</p>
          <p style={{ margin: "5px 0", fontSize: "18px" }}><strong>Total :</strong> <span style={{ color: "#0E4B32", fontWeight: "bold" }}>USD {order.totalFinal}</span></p>
          
          {/* Action Buttons Section */}
          <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
            {/* Download Invoice Button */}
            <button
              onClick={downloadInvoice}
              style={{
                background: "#0E4B32",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              📄 Download Invoice
            </button>

            {/* Track Shipment Link Button */}
            <Link
              to={`/tracking/${order.id}`}
              style={{
                background: "#0E4B32",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-block",
                fontWeight: "bold",
              }}
            >
              🚚 Track Shipment
            </Link>
          </div>
        </div>

        <div>
          <p style={{ margin: "5px 0" }}>
            <strong>Status :</strong>
            <span
              style={{
                background:
                  order.status === "DELIVERED"
                    ? "#28a745"
                    : order.status === "SHIPPED"
                    ? "#007bff"
                    : "#ffc107",
                color: order.status === "PENDING" ? "#000" : "#fff",
                padding: "4px 12px",
                borderRadius: "20px",
                marginLeft: "10px",
                fontSize: "13px",
                fontWeight: "bold"
              }}
            >
              {order.status}
            </span>
          </p>
        </div>
      </div>

      {/* Amazon Style Tracking Timeline Box */}
      <div style={{ margin: "25px 0", padding: "20px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
        <h4 style={{ marginTop: 0, marginBottom: "15px", color: "#333" }}>Order Tracking Timeline</h4>
        <OrderTimeline status={order.status} />
      </div>

      {/* Delivery Address Section */}
      {order.address && (
        <div style={{ margin: "25px 0", padding: "20px", background: "#f4f7f5", borderRadius: "8px", borderLeft: "4px solid #0E4B32" }}>
          <h4 style={{ marginTop: 0, marginBottom: "10px", color: "#0E4B32" }}>Delivery Address</h4>
          <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>{order.address.fullName}</p>
          <p style={{ margin: "0 0 5px 0", color: "#555" }}>{order.address.street}</p>
          <p style={{ margin: "0", color: "#555" }}>{order.address.city}</p>
        </div>
      )}

      <hr style={{ border: "0", height: "1px", background: "#eee", margin: "25px 0" }} />

      <h3 style={{ color: "#333", marginBottom: "15px" }}>Products Ordered</h3>
      {order.items?.map((item: any) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #eaeaea",
            padding: "20px",
            marginBottom: "15px",
            borderRadius: "8px",
            backgroundColor: "#fff",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px"
          }}
        >
          <p style={{ margin: 0 }}><strong>SKU :</strong> {item.productVariant?.sku}</p>
          <p style={{ margin: 0 }}><strong>Weight :</strong> {item.productVariant?.weight}</p>
          <p style={{ margin: 0 }}><strong>Price :</strong> USD {item.price}</p>
          <p style={{ margin: 0 }}><strong>Quantity :</strong> {item.quantity}</p>
          <p style={{ margin: "10px 0 0 0", gridColumn: "span 2", borderTop: "1px dashed #eee", paddingTop: "10px" }}>
            <strong>Subtotal :</strong> <span style={{ color: "#0E4B32", fontWeight: "bold" }}>USD {item.price * item.quantity}</span>
          </p>
        </div>
      ))}
    </div>
  );
}