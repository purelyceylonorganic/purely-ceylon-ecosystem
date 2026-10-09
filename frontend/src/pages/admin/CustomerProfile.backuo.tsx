import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customerService } from "../../services/customer.service";
import CustomerNotes from "../../components/admin/customer/CustomerNotes";

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCustomer = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await customerService.getCustomerProfile(id);

        if (!cancelled) {
          setCustomer(response);
        }
      } catch (error) {
        console.error("Customer Profile Error:", error);

        if (!cancelled) {
          setCustomer(null);
          alert("Unable to load customer profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500 sm:p-8">
        Loading customer profile...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 text-center sm:p-8">
        <p className="text-slate-600">Customer not found.</p>

        <button
          type="button"
          onClick={() => navigate("/admin/customers")}
          className="mt-4 rounded-lg bg-[#0E4B32] px-4 py-3 text-white hover:bg-[#0b3d29]"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  const orders = customer.orders || [];
  const addresses = customer.addresses || [];

  const totalSpent = orders.reduce(
    (sum: number, order: any) =>
      sum + Number(order.totalFinal || 0),
    0
  );

  const totalPaid = orders.reduce(
    (sum: number, order: any) =>
      sum + Number(order.paidAmount || 0),
    0
  );

  const totalBalance = orders.reduce(
    (sum: number, order: any) =>
      sum + Number(order.balance || 0),
    0
  );

  const lastOrder = orders[0];

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-GB");
  };

  return (
    <div className="mx-auto w-full min-w-0 space-y-5 px-3 py-4 sm:space-y-6 sm:p-6 lg:px-8">

      {/* HEADER */}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate("/admin/customers")}
            className="mb-3 text-sm text-blue-600 hover:underline"
          >
            ← Back to Customers
          </button>

          <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">
            {customer.fullName}
          </h1>

          <p className="mt-1 break-all text-xs text-slate-500 sm:text-sm">
            Customer ID: {customer.id}
          </p>
        </div>

        <div className="shrink-0">
          {customer.isActive ? (
            <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              🟢 Active
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
              🔴 Inactive
            </span>
          )}
        </div>
      </div>

      {/* CUSTOMER INFORMATION AND SUMMARY */}
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">

        {/* CUSTOMER INFORMATION */}
        <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <h2 className="mb-5 text-lg font-bold sm:text-xl">
            Customer Information
          </h2>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="mt-1 break-words font-semibold">
                {customer.fullName}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="mt-1 break-words font-semibold">
                📞 {customer.phone || "Not provided"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 break-all font-semibold">
                {customer.email || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Account Status</p>
              <p className="mt-1 font-semibold">
                {customer.isActive ? "Active" : "Inactive"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Verification</p>
              <p className="mt-1 font-semibold">
                {customer.isVerified ? "✓ Verified" : "Not Verified"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Customer Since</p>
              <p className="mt-1 font-semibold">
                {formatDate(customer.createdAt)}
              </p>
            </div>

          </div>
        </div>

        {/* CUSTOMER SUMMARY */}
        <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-bold sm:text-xl">
            Customer Summary
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-1">

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="mt-1 text-2xl font-bold">
                {orders.length}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Total Spent</p>
              <p className="mt-1 break-words text-xl font-bold text-green-700 sm:text-2xl">
                LKR {totalSpent.toLocaleString()}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Total Paid</p>
              <p className="mt-1 break-words text-lg font-bold sm:text-xl">
                LKR {totalPaid.toLocaleString()}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Outstanding Balance</p>
              <p className="mt-1 break-words text-lg font-bold text-red-600 sm:text-xl">
                LKR {totalBalance.toLocaleString()}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ADDRESSES */}
      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold sm:text-xl">
            📍 Addresses
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate(`/admin/customers/${customer.id}/add-address`)
            }
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            + Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-sm text-slate-500">
            No address added yet.
          </p>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses.map((address: any) => (
              <div
                key={address.id}
                className="min-w-0 rounded-lg border p-4 sm:p-5"
              >
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <h3 className="break-words font-semibold">
                    {address.fullName}
                  </h3>

                  {address.isDefault && (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      Default
                    </span>
                  )}
                </div>

                <p className="break-words text-sm text-slate-600">
                  📞 {address.phone || "Not provided"}
                </p>

                <p className="mt-2 break-words text-sm text-slate-600">
                  {address.street}
                  <br />
                  {address.city}
                  {address.province && `, ${address.province}`}
                  {address.postalCode && ` - ${address.postalCode}`}
                  <br />
                  {address.country}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ORDER HISTORY */}
      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-bold sm:text-xl">
          🛒 Order History
        </h2>

        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders found.</p>
        ) : (
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b text-sm text-slate-500">
                  <th className="whitespace-nowrap p-3">Date</th>
                  <th className="whitespace-nowrap p-3">Order</th>
                  <th className="whitespace-nowrap p-3">Status</th>
                  <th className="whitespace-nowrap p-3">Payment</th>
                  <th className="whitespace-nowrap p-3">Total</th>
                  <th className="whitespace-nowrap p-3">Balance</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-0"
                  >
                    <td className="whitespace-nowrap p-3 text-sm">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="p-3">
                      <span className="whitespace-nowrap font-medium">
                        #{String(order.id).slice(0, 8)}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs">
                        {order.status || "-"}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          order.paymentStatus === "PAID"
                            ? "whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                            : "whitespace-nowrap rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                        }
                      >
                        {order.paymentStatus || "UNKNOWN"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap p-3 font-semibold">
                      {order.currency || "LKR"}{" "}
                      {Number(order.totalFinal || 0).toLocaleString()}
                    </td>

                    <td className="whitespace-nowrap p-3 font-semibold">
                      {Number(order.balance || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LATEST DELIVERY */}
      {lastOrder && (
        <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-bold sm:text-xl">
            🚚 Latest Delivery
          </h2>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Delivery Status</p>
              <p className="mt-1 break-words font-semibold">
                {lastOrder.shippingStatus || "Not available"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Tracking ID</p>
              <p className="mt-1 break-all font-semibold">
                {lastOrder.trackingId || "-"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Last Order</p>
              <p className="mt-1 font-semibold">
                {formatDate(lastOrder.createdAt)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Payment</p>
              <p className="mt-1 break-words font-semibold">
                {lastOrder.paymentStatus || "Not available"}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOMER NOTES */}
      <div className="min-w-0">
        <CustomerNotes customerId={customer.id} />
      </div>

    </div>
  );
}
