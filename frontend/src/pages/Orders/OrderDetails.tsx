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
    const response = await orderService.getOrderDetails(orderId);
    setOrder(response);
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
    return (
      <div className="mx-auto flex min-h-[50vh] w-full items-center justify-center px-4 py-10">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#0E4B32]" />

          <h2 className="text-lg font-bold text-[#0E4B32]">
            Loading Order...
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Please wait while we load your order.
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
            ⚠️
          </div>

          <h2 className="text-xl font-extrabold text-red-600">
            Order Not Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            We could not find the requested order.
          </p>
        </div>
      </div>
    );
  }

  const status =
    order.status?.toUpperCase() || "UNKNOWN";

  const statusClasses =
    status === "DELIVERED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "SHIPPED"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : status === "PROCESSING"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : status === "CANCELLED"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  const paymentStatus = order.paymentStatus?.toUpperCase() || "UNKNOWN";

  return (
    <div className="mx-auto w-full max-w-5xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

      {/* ================= HEADER ================= */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
            Customer Order
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-[#0E4B32] sm:text-3xl">
            Order Details
          </h1>

          <p className="mt-2 break-all text-xs text-gray-500 sm:text-sm">
            Order ID: {order.id}
          </p>
        </div>

        {/* STATUS */}
        <span
          className={`inline-flex w-fit rounded-full border px-4 py-2 text-xs font-extrabold ${statusClasses}`}
        >
          {status}
        </span>
      </div>

      {/* ================= ORDER SUMMARY ================= */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] font-bold text-white">
            1
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Order Summary
            </h2>

            <p className="text-xs text-gray-500 sm:text-sm">
              Your order and payment information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* ORDER ID */}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Order ID
            </p>

            <p className="mt-1 break-all text-sm font-bold text-gray-900">
              {order.id}
            </p>
          </div>

          {/* ORDER DATE */}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Order Date
            </p>

            <p className="mt-1 text-sm font-bold text-gray-900">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>

          {/* PAYMENT */}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Payment
            </p>

            <p
              className={`mt-1 text-sm font-bold ${
                paymentStatus === "UNPAID"
                  ? "text-red-600"
                  : "text-emerald-600"
              }`}
            >
              {order.paymentStatus}
            </p>
          </div>

          {/* TOTAL */}
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Grand Total
            </p>

            <p className="mt-1 text-xl font-extrabold text-[#0E4B32]">
              USD {Number(order.totalFinal || 0).toFixed(2)}
            </p>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <button
            type="button"
            onClick={downloadInvoice}
            className="min-h-[50px] rounded-xl border border-[#0E4B32] bg-white px-5 py-3 text-sm font-bold text-[#0E4B32] transition hover:bg-[#0E4B32] hover:text-white"
          >
            📄 Download Invoice
          </button>

          <Link
            to={`/tracking/${order.id}`}
            className="flex min-h-[50px] items-center justify-center rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#111111]"
          >
            🚚 Track Shipment
          </Link>

        </div>
      </section>

      {/* ================= TRACKING TIMELINE ================= */}
      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] font-bold text-white">
            2
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Order Tracking
            </h2>

            <p className="text-xs text-gray-500 sm:text-sm">
              Follow your order progress
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-6">
          <OrderTimeline status={order.status} />
        </div>
      </section>

      {/* ================= DELIVERY ADDRESS ================= */}
      {order.address && (
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] font-bold text-white">
              3
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
                Delivery Address
              </h2>

              <p className="text-xs text-gray-500 sm:text-sm">
                Shipping destination for this order
              </p>
            </div>
          </div>

          <div className="rounded-xl border-l-4 border-[#0E4B32] bg-[#F4F7F5] p-4 sm:p-5">

            <p className="text-sm font-extrabold text-gray-900">
              {order.address.fullName}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {order.address.street}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {order.address.city}
            </p>

            {order.address.country && (
              <p className="mt-1 text-sm text-gray-600">
                {order.address.country}
              </p>
            )}

          </div>
        </section>
      )}

      {/* ================= PRODUCTS ================= */}
      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] font-bold text-white">
            4
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Products Ordered
            </h2>

            <p className="text-xs text-gray-500 sm:text-sm">
              Items included in this order
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <article
              key={item.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4">

                {/* PRODUCT HEADER */}
                <div className="min-w-0">
                  <h3 className="break-words text-base font-extrabold text-gray-900">
                    {item.productVariant?.product?.name ||
                      item.productName ||
                      "Product"}
                  </h3>

                  {item.productVariant?.sku && (
                    <p className="mt-1 break-all text-xs text-gray-500">
                      SKU: {item.productVariant.sku}
                    </p>
                  )}
                </div>

                {/* PRODUCT DETAILS */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase text-gray-400">
                      Weight
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-800">
                      {item.productVariant?.weight || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase text-gray-400">
                      Price
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-800">
                      USD {Number(item.price || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase text-gray-400">
                      Quantity
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-800">
                      {item.quantity}
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-[11px] font-semibold uppercase text-emerald-700">
                      Subtotal
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-[#0E4B32]">
                      USD{" "}
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                      ).toFixed(2)}
                    </p>
                  </div>

                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}