import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../../services/order.service";
import DeliveryTimeline from "../../components/orders/DeliveryTimeline";

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 10-second auto refresh
  useEffect(() => {
    if (id) {
      loadOrder(id);

      const interval = setInterval(() => {
        loadOrder(id);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [id]);

  async function loadOrder(orderId: string) {
    try {
      const response = await orderService.getOrderDetails(orderId);

      console.log("Tracking Order Response:", response);

      setOrder(response);
    } catch (error) {
      console.error("Tracking Error:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full items-center justify-center px-4 py-10">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#0E4B32]" />

          <h2 className="text-lg font-bold text-[#0E4B32]">
            Loading tracking status...
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Please wait while we get the latest shipment status.
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

          <p className="mt-2 text-sm leading-6 text-gray-500">
            We could not find the tracking information for this order.
          </p>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="mt-6 min-h-[48px] w-full rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#111111]"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Original tracking steps
  const steps = [
    "PENDING",
    "READY_TO_SHIP",
    "SHIPPED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const currentStep = steps.indexOf(
    order.shippingStatus || "PENDING"
  );

  const shippingStatus =
    order.shippingStatus || "PENDING";

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

      {/* ================= BREADCRUMB ================= */}
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="font-bold text-[#0E4B32] hover:underline"
        >
          My Orders
        </button>

        <span className="text-gray-400">/</span>

        <span className="text-gray-500">
          Track Order
        </span>
      </div>

      {/* ================= HEADER ================= */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
              Live Shipment Tracking
            </p>

            <h1 className="mt-1 break-words text-xl font-extrabold text-[#111111] sm:text-2xl lg:text-3xl">
              Track Your Order #
              {order.id?.slice(-6).toUpperCase()}
            </h1>

            <p className="mt-2 break-all text-xs text-gray-500 sm:text-sm">
              Order ID:{" "}
              <span className="font-semibold text-gray-700">
                {order.id}
              </span>
            </p>
          </div>

          {/* CURRENT STATUS */}
          <div className="w-fit rounded-full border border-sky-200 bg-sky-50 px-4 py-2">
            <span className="text-xs font-extrabold tracking-wide text-sky-700 sm:text-sm">
              {shippingStatus.replace(/_/g, " ")}
            </span>
          </div>

        </div>
      </section>

      {/* ================= DELIVERY TIMELINE ================= */}
      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">

        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
            Delivery Progress
          </h2>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Your order's current shipping progress
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-6">
          <div className="min-w-[620px]">
            <DeliveryTimeline status={shippingStatus} />
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8">

        {/* ================= LIVE PROGRESS ================= */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">

          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Live Shipment Progress
            </h2>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Your shipment status updates automatically.
            </p>
          </div>

          <div className="relative pl-9">

            {/* VERTICAL LINE */}
            <div className="absolute bottom-3 left-[11px] top-3 w-0.5 bg-gray-200" />

            <div className="space-y-7">
              {steps.map((step, idx) => {
                const completed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div
                    key={step}
                    className="relative flex min-h-[28px] items-center"
                  >

                    {/* STATUS DOT */}
                    <div
                      className={`absolute -left-9 z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        completed
                          ? "bg-[#0E4B32] text-white"
                          : "bg-gray-200 text-gray-400"
                      } ${
                        isCurrent
                          ? "ring-4 ring-[#0E4B32]/10"
                          : ""
                      }`}
                    >
                      {completed ? "✓" : ""}
                    </div>

                    {/* STATUS TEXT */}
                    <div className="min-w-0">
                      <p
                        className={`break-words text-sm font-bold tracking-wide ${
                          completed
                            ? "text-[#0E4B32]"
                            : "text-gray-400"
                        }`}
                      >
                        {step.replace(/_/g, " ")}
                      </p>

                      {isCurrent && (
                        <p className="mt-1 text-xs font-medium text-[#D4AF37]">
                          Current shipment status
                        </p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="space-y-6">

          {/* SHIPMENT OVERVIEW */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] text-lg">
                📦
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  Shipment Overview
                </h2>

                <p className="text-xs text-gray-500">
                  Current shipment information
                </p>
              </div>
            </div>

            <div className="space-y-4">

              {/* TRACKING NUMBER */}
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Tracking Number
                </p>

                <p className="mt-1 break-all text-sm font-bold text-gray-800">
                  {order.trackingId || "Not Assigned"}
                </p>
              </div>

              {/* PAYMENT METHOD */}
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Payment Method
                </p>

                <p className="mt-1 text-sm font-bold text-gray-800">
                  {order.paymentMethod || "CARD"}
                </p>
              </div>

              {/* TOTAL */}
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                  Total Amount
                </p>

                <p className="mt-1 text-lg font-extrabold text-[#0E4B32]">
                  {order.currency || "USD"}{" "}
                  {Number(order.totalFinal || 0).toFixed(2)}
                </p>
              </div>

            </div>
          </section>

          {/* DELIVERY ADDRESS */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E4B32] text-lg">
                📍
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  Delivery Address
                </h2>

                <p className="text-xs text-gray-500">
                  Shipping destination
                </p>
              </div>
            </div>

            <div className="rounded-xl border-l-4 border-[#0E4B32] bg-[#F4F7F5] p-4">

              <p className="text-sm font-extrabold text-gray-900">
                {order.address?.fullName ||
                  "MUHAMMADU NALEEM HADEEJA BANU"}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {order.address?.street || "649/2"}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {order.address?.city || "Madurankuliya"}
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {order.address?.country || "Sri Lanka"}
              </p>

            </div>
          </section>

        </div>
      </div>

      {/* ================= AUTO REFRESH NOTICE ================= */}
      <div className="mt-6 rounded-xl border border-[#D4AF37]/30 bg-[#FFF8EE] px-4 py-3 text-center sm:mt-8">
        <p className="text-xs font-medium text-gray-600">
          🔄 Tracking status automatically refreshes every 10 seconds.
        </p>
      </div>

    </div>
  );
}