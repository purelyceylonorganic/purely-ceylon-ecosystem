import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderService } from "../../services/order.service";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-cyan-100 text-cyan-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-900",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await orderService.getAllOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Orders could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function changeStatus(orderId: string, status: string) {
    setUpdatingOrderId(orderId);

    try {
      await orderService.updateOrderStatus(orderId, status);
      await loadOrders();
      alert("Order status updated successfully.");
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Could not update order status. Please try again.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString();
  }

  function formatTotal(order: any) {
    const amount = Number(order.totalFinal ?? 0);

    if (!Number.isFinite(amount)) {
      return "—";
    }

    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <main className="mx-auto w-full max-w-7xl min-w-0 px-3 py-5 font-sans sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#0E4B32] sm:text-3xl">
          Admin Orders Management
        </h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600 sm:text-base">
            Total Orders:{" "}
            <span className="font-bold text-gray-900">{orders.length}</span>
          </p>

          <button
            type="button"
            onClick={() => void loadOrders()}
            disabled={loading}
            className="rounded-lg border border-[#0E4B32] px-4 py-2 text-sm font-semibold text-[#0E4B32] hover:bg-green-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Orders"}
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="mt-2 font-bold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          Loading orders...
        </div>
      ) : !error && orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="font-semibold text-gray-800">No orders found</h2>
          <p className="mt-2 text-sm text-gray-500">
            Orders will appear here when available.
          </p>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          {orders.map((order) => {
            const status = String(order.status || "PENDING").toUpperCase();

            return (
              <article
                key={order.id}
                className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Order and customer information */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order ID
                    </p>

                    <p className="mt-1 break-all text-sm font-bold text-gray-900 sm:text-base">
                      {order.id}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Customer
                        </p>
                        <p className="mt-1 break-words text-sm font-medium text-gray-800">
                          {order.user?.fullName || "Unknown Customer"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Order Date
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600">
                        Total:
                      </span>
                      <span className="text-lg font-bold text-[#0E4B32]">
                        {order.currency || "USD"} {formatTotal(order)}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-600">
                        Status:
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          STATUS_COLORS[status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex w-full min-w-0 flex-col gap-3 border-t border-gray-100 pt-4 lg:w-auto lg:min-w-[230px] lg:border-t-0 lg:pt-0">
                    <div className="min-w-0">
                      <label
                        htmlFor={`status-${order.id}`}
                        className="mb-2 block text-xs font-bold tracking-wide text-gray-600"
                      >
                        CHANGE STATUS
                      </label>

                      <select
                        id={`status-${order.id}`}
                        value={status}
                        disabled={updatingOrderId === order.id}
                        onChange={(e) =>
                          void changeStatus(order.id, e.target.value)
                        }
                        className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#0E4B32] focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      {updatingOrderId === order.id && (
                        <p className="mt-1 text-xs text-gray-500">
                          Updating status...
                        </p>
                      )}
                    </div>

                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border-2 border-[#0E4B32] px-4 py-2.5 text-center text-sm font-bold text-[#0E4B32] transition hover:bg-[#0E4B32] hover:text-white lg:w-auto"
                    >
                      View Order Details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}