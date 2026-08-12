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
    if (id) {
      loadCustomer();
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);

      const response =
        await customerService.getCustomerProfile(id!);

      setCustomer(response);
    } catch (error) {
      console.error("Customer Profile Error:", error);
      alert("Unable to load customer profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading customer profile...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        Customer not found.
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

  return (
    <div className="space-y-6 p-6">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <button
            onClick={() => navigate("/admin/customers")}
            className="mb-3 text-sm text-blue-600 hover:underline"
          >
            ← Back to Customers
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            {customer.fullName}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Customer ID: {customer.id}
          </p>
        </div>

        <div>
          {customer.isActive ? (
            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              🟢 Active
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
              🔴 Inactive
            </span>
          )}
        </div>
      </div>


      {/* =========================================
          CUSTOMER BASIC INFORMATION
      ========================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">

          <h2 className="mb-5 text-xl font-bold">
            Customer Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <p className="text-sm text-slate-500">
                Full Name
              </p>

              <p className="mt-1 font-semibold">
                {customer.fullName}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Phone
              </p>

              <p className="mt-1 font-semibold">
                📞 {customer.phone || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Email
              </p>

              <p className="mt-1 font-semibold">
                {customer.email || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Account Status
              </p>

              <p className="mt-1 font-semibold">
                {customer.isActive
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Verification
              </p>

              <p className="mt-1 font-semibold">
                {customer.isVerified
                  ? "✓ Verified"
                  : "Not Verified"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Customer Since
              </p>

              <p className="mt-1 font-semibold">
                {new Date(
                  customer.createdAt
                ).toLocaleDateString()}
              </p>
            </div>

          </div>
        </div>


        {/* =========================================
            QUICK SUMMARY
        ========================================= */}

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold">
            Customer Summary
          </h2>

          <div className="space-y-4">

            <div>
              <p className="text-sm text-slate-500">
                Total Orders
              </p>

              <p className="text-2xl font-bold">
                {orders.length}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Spent
              </p>

              <p className="text-2xl font-bold text-green-700">
                LKR {totalSpent.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Paid
              </p>

              <p className="text-xl font-bold">
                LKR {totalPaid.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Outstanding Balance
              </p>

              <p className="text-xl font-bold text-red-600">
                LKR {totalBalance.toLocaleString()}
              </p>
            </div>

          </div>
        </div>

      </div>


      {/* =========================================
          ADDRESSES
      ========================================= */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-bold">
            📍 Addresses
          </h2>

          <button
            onClick={() =>
              navigate(
                `/admin/customers/${customer.id}/add-address`
              )
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Address
          </button>

        </div>

        {addresses.length === 0 ? (

          <p className="text-slate-500">
            No address added yet.
          </p>

        ) : (

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {addresses.map((address: any) => (

              <div
                key={address.id}
                className="rounded-lg border p-5"
              >

                <div className="mb-2 flex justify-between">

                  <h3 className="font-semibold">
                    {address.fullName}
                  </h3>

                  {address.isDefault && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      Default
                    </span>
                  )}

                </div>

                <p className="text-sm text-slate-600">
                  📞 {address.phone}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {address.street}
                  <br />
                  {address.city}
                  {address.province &&
                    `, ${address.province}`}
                  {address.postalCode &&
                    ` - ${address.postalCode}`}
                  <br />
                  {address.country}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* =========================================
          ORDER HISTORY
      ========================================= */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-bold">
          🛒 Order History
        </h2>

        {orders.length === 0 ? (

          <p className="text-slate-500">
            No orders found.
          </p>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b text-sm text-slate-500">
                  <th className="p-3">
                    Date
                  </th>

                  <th className="p-3">
                    Order
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                  <th className="p-3">
                    Payment
                  </th>

                  <th className="p-3">
                    Total
                  </th>

                  <th className="p-3">
                    Balance
                  </th>
                </tr>
              </thead>

              <tbody>

                {orders.map((order: any) => (

                  <tr
                    key={order.id}
                    className="border-b last:border-0"
                  >

                    <td className="p-3 text-sm">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      <span className="font-medium">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                        {order.status}
                      </span>
                    </td>

                    <td className="p-3">

                      <span
                        className={
                          order.paymentStatus ===
                          "PAID"
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                            : "rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                        }
                      >
                        {order.paymentStatus}
                      </span>

                    </td>

                    <td className="p-3 font-semibold">
                      {order.currency}{" "}
                      {Number(
                        order.totalFinal
                      ).toLocaleString()}
                    </td>

                    <td className="p-3 font-semibold">
                      {Number(
                        order.balance || 0
                      ).toLocaleString()}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =========================================
          LAST DELIVERY
      ========================================= */}

      {lastOrder && (

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold">
            🚚 Latest Delivery
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">

            <div>
              <p className="text-sm text-slate-500">
                Delivery Status
              </p>

              <p className="mt-1 font-semibold">
                {lastOrder.shippingStatus}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Tracking ID
              </p>

              <p className="mt-1 font-semibold">
                {lastOrder.trackingId || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Last Order
              </p>

              <p className="mt-1 font-semibold">
                {new Date(
                  lastOrder.createdAt
                ).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Payment
              </p>

              <p className="mt-1 font-semibold">
                {lastOrder.paymentStatus}
              </p>
            </div>

          </div>

        </div>

      )}


      {/* =========================================
          CUSTOMER NOTES
      ========================================= */}

      <CustomerNotes customerId={customer.id} />

    </div>
  );
}