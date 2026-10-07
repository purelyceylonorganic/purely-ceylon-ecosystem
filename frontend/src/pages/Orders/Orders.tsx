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

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
        };

      case "PENDING":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
        };

      case "SHIPPED":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
        };

      case "PROCESSING":
        return {
          bg: "bg-sky-50",
          text: "text-sky-700",
        };

      case "CANCELLED":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
        };

      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
        };
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#0E4B32]" />

          <h3 className="text-base font-bold text-[#0E4B32] sm:text-lg">
            Loading Your Orders...
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0E4B32]/10 text-3xl">
            📦
          </div>

          <h3 className="text-xl font-extrabold text-gray-800">
            No Orders Found
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            You haven't placed any orders yet.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-6 min-h-[48px] w-full rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#111111]"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {/* PAGE HEADER */}
      <div className="mb-6 sm:mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
          Account
        </p>

        <h1 className="mt-1 text-2xl font-extrabold text-[#0E4B32] sm:text-3xl">
          My Orders
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          View and track all your orders.
        </p>
      </div>

      {/* ================= MOBILE ORDER CARDS ================= */}
      <div className="space-y-4 md:hidden">
        {orders.map((order) => {
          const statusStyle = getStatusColor(order.status);
          const itemsCount = order.items ? order.items.length : 0;

          return (
            <article
              key={order.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              {/* CARD HEADER */}
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/70 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Order ID
                  </p>

                  <h3 className="mt-1 break-all text-sm font-extrabold text-gray-900">
                    #{order.id?.slice(-8).toUpperCase()}
                  </h3>

                  <p className="mt-1 text-[11px] text-gray-400">
                    Full ID: {order.id?.slice(0, 8)}...
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {order.status}
                </span>
              </div>

              {/* CARD BODY */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* ITEMS */}
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Items
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {itemsCount}{" "}
                      {itemsCount > 1 ? "Items" : "Item"}
                    </p>
                  </div>

                  {/* TOTAL */}
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Total
                    </p>

                    <p className="mt-1 break-words text-sm font-extrabold text-[#0E4B32]">
                      USD{" "}
                      {order.totalFinal?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* PAYMENT */}
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Payment
                    </p>

                    <p
                      className={`mt-1 text-sm font-bold ${
                        order.paymentStatus?.toUpperCase() === "UNPAID"
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {order.paymentStatus}
                    </p>
                  </div>

                  {/* STATUS */}
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Status
                    </p>

                    <p
                      className={`mt-1 text-sm font-bold ${statusStyle.text}`}
                    >
                      {order.status}
                    </p>
                  </div>
                </div>

                {/* TRACK BUTTON */}
                <button
                  type="button"
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="mt-4 min-h-[48px] w-full rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#111111]"
                >
                  Track Order →
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 text-sm font-bold text-gray-600">
                  Order ID
                </th>

                <th className="px-4 py-4 text-sm font-bold text-gray-600">
                  Items
                </th>

                <th className="px-4 py-4 text-sm font-bold text-gray-600">
                  Total
                </th>

                <th className="px-4 py-4 text-sm font-bold text-gray-600">
                  Payment
                </th>

                <th className="px-4 py-4 text-sm font-bold text-gray-600">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const statusStyle = getStatusColor(order.status);
                const itemsCount = order.items ? order.items.length : 0;

                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 transition hover:bg-gray-50"
                  >
                    {/* ORDER ID */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        #{order.id?.slice(-8).toUpperCase()}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Full ID: {order.id?.slice(0, 8)}...
                      </p>
                    </td>

                    {/* ITEMS */}
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {itemsCount}{" "}
                      {itemsCount > 1 ? "Items" : "Item"}
                    </td>

                    {/* TOTAL */}
                    <td className="px-4 py-4 text-sm font-bold text-gray-900">
                      USD{" "}
                      {order.totalFinal?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* PAYMENT */}
                    <td className="px-4 py-4">
                      <span
                        className={`text-sm font-bold ${
                          order.paymentStatus?.toUpperCase() === "UNPAID"
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="rounded-lg bg-[#0E4B32] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#111111]"
                      >
                        Track Order →
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