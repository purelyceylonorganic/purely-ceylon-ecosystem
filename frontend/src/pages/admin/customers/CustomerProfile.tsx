import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customerService } from "../../../services/customer.service";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province?: string | null;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  weight: string;
  price: number;
  product: Product;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productVariantId: string;
  productVariant: ProductVariant;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  gateway?: string | null;
  paidAt?: string | null;
  transactionId?: string | null;
}

interface CustomerNote {
  id: string;
  note: string;
  createdAt: string;
  updatedAt?: string | null;
}

interface Customer {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;

  addresses: Address[];
  orders: Order[];

  notes: CustomerNote[];
}

interface Order {
  id: string;
  createdAt: string;
  paymentMethod?: string | null;
  paymentStatus: string;
  paidAmount: number;
  balance: number;
  paidAt?: string | null;
  shippingCost: number;
  shippingStatus: string;
  taxAmount: number;
  trackingId?: string | null;
  status: string;
  currency: string;
  exchangeRate: number;
  totalFinal: number;
  totalUSD: number;
  address?: Address | null;
  items: OrderItem[];
  payments: Payment[];
}

interface Customer {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  addresses: Address[];
  orders: Order[];
}

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!id) return;

    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
  try {
    setLoading(true);
    setError("");

    if (!id) {
      throw new Error("Customer ID is missing");
    }

    const customer =
      await customerService.getCustomerProfile(id);

    if (!customer) {
      throw new Error(
        "Customer data not found"
      );
    }

    setCustomer(customer);

  } catch (error: any) {
    console.error(
      "Customer Profile Error:",
      error
    );

    setError(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to load customer"
    );

  } finally {
    setLoading(false);
  }
};

  const formatDate = (date?: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (
    date?: string | null
  ) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-GB"
    );
  };

  const formatMoney = (
    amount: number,
    currency: string
  ) => {
    return `${currency} ${amount.toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

const totalPaid =
  customer?.orders?.reduce(
    (sum, order) => sum + order.paidAmount,
    0
  ) ?? 0;

const totalOutstanding =
  customer?.orders?.reduce((sum, order) => sum + order.balance, 0) ?? 0;
  if (loading) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-gray-500">
        Loading customer...
      </div>
    </div>
  );
}

if (!customer) {
  return (
    <div className="space-y-4 p-6">
      <button
        onClick={() =>
          navigate("/admin/customers")
        }
        className="rounded-lg border px-4 py-2"
      >
        ← Back to Customers
      </button>

      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Customer not found"}
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6 p-6">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <button
            onClick={() =>
              navigate("/admin/customers")
            }
            className="mb-3 text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Customers
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            {customer.fullName}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Customer ID: {customer.id}
          </p>
        </div>

        <div className="flex gap-2">

          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              customer.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {customer.isActive
              ? "● Active"
              : "● Inactive"}
          </span>

          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              customer.isVerified
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {customer.isVerified
              ? "Verified"
              : "Not Verified"}
          </span>

        </div>
      </div>

      {/* ===================================== */}
      {/* CUSTOMER INFORMATION */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">

          <h2 className="mb-5 text-xl font-semibold">
            Customer Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <InfoItem
              label="Full Name"
              value={customer.fullName}
            />

            <InfoItem
              label="Phone"
              value={customer.phone || "-"}
            />

            <InfoItem
              label="Email"
              value={customer.email || "Not added"}
            />

            <InfoItem
              label="Role"
              value={customer.role}
            />

            <InfoItem
              label="Customer Since"
              value={formatDate(
                customer.createdAt
              )}
            />

            <InfoItem
              label="Total Orders"
              value={String(
                customer.orders.length
              )}
            />

          </div>
        </div>

        {/* ================================= */}
        {/* SUMMARY */}
        {/* ================================= */}

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-semibold">
            Summary
          </h2>

          <div className="space-y-4">

            <SummaryItem
              label="Orders"
              value={customer.orders.length}
            />

            <SummaryItem
              label="Addresses"
              value={customer.addresses.length}
            />

            <SummaryItem
              label="Total Spent"
              value={customer.orders.reduce(
                (sum, order) =>
                  sum + order.totalFinal,
                0
              )}
            />

            <SummaryItem
  label="Total Orders"
  value={customer.orders.length}
/>

<SummaryItem
  label="Total Paid"
  value={totalPaid}
/>

<SummaryItem
  label="Outstanding"
  value={totalOutstanding}
/>

          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* ADDRESSES */}
      {/* ===================================== */}

      <section>

        <h2 className="mb-4 text-xl font-semibold">
          📍 Addresses
        </h2>

        {customer.addresses.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-gray-500">
            No addresses found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {customer.addresses.map(
              (address) => (
                <div
                  key={address.id}
                  className="rounded-xl border bg-white p-6 shadow-sm"
                >

                  <div className="mb-3 flex items-center justify-between">

                    <h3 className="font-semibold">
                      {address.fullName}
                    </h3>

                    {address.isDefault && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Default
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-gray-600">
                    📞 {address.phone}
                  </p>

                  <p className="mt-3 text-sm text-gray-700">
                    {address.street}
                  </p>

                  <p className="text-sm text-gray-700">
                    {address.city}
                  </p>

                  {address.province && (
                    <p className="text-sm text-gray-700">
                      {address.province}
                    </p>
                  )}

                  {address.postalCode && (
                    <p className="text-sm text-gray-700">
                      {address.postalCode}
                    </p>
                  )}

                  <p className="text-sm text-gray-700">
                    {address.country}
                  </p>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* ===================================== */}
      {/* ORDER HISTORY */}
      {/* ===================================== */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            🛒 Order History
          </h2>

          <span className="text-sm text-gray-500">
            {customer.orders.length} Orders
          </span>

        </div>

        {customer.orders.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-gray-500">
            No orders found.
          </div>
        ) : (
          <div className="space-y-5">

            {customer.orders.map(
              (order) => (
                <div
                  key={order.id}
                  className="rounded-xl border bg-white p-6 shadow-sm"
                >

                  {/* ORDER HEADER */}

                  <div className="flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">

                    <div>
                      <h3 className="font-semibold">
                        Order #{order.id.slice(0, 8)}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatDateTime(
                          order.createdAt
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">

                      <StatusBadge
                        label={order.status}
                      />

                      <PaymentStatusBadge
  status={order.paymentStatus}
/>

                      <StatusBadge
                        label={
                          order.shippingStatus
                        }
                      />

                    </div>

                  </div>

                  {/* ORDER DETAILS */}

                  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">

  <InfoItem
    label="Total"
    value={formatMoney(
      order.totalFinal,
      order.currency
    )}
  />

  <InfoItem
    label="Paid"
    value={formatMoney(
      order.paidAmount,
      order.currency
    )}
  />

  <InfoItem
    label="Balance"
    value={formatMoney(
      order.balance,
      order.currency
    )}
  />

  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
      Payment Status
    </p>

    <div className="mt-2">
      <PaymentStatusBadge
        status={order.paymentStatus}
      />
    </div>
  </div>

</div>

                  {/* ORDER ITEMS */}

                  <div className="mt-6">

                    <h4 className="mb-3 font-medium">
                      Order Items
                    </h4>

                    {order.items.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No items found.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                          <thead>
                            <tr className="border-b text-left text-gray-500">

                              <th className="pb-3">
  Product
</th>

                              <th className="pb-3">
                                Quantity
                              </th>

                              <th className="pb-3">
                                Price
                              </th>

                              <th className="pb-3">
                                Total
                              </th>

                            </tr>
                          </thead>

                          <tbody>

                            {order.items.map(
                              (item) => (
                                <tr
                                  key={item.id}
                                  className="border-b last:border-0"
                                >

                                  <td className="py-3">
  <div>
    <p className="font-medium text-gray-900">
      {item.productVariant.product.name}
    </p>

    <p className="text-xs text-gray-500">
      SKU: {item.productVariant.sku}
    </p>

    <p className="text-xs text-gray-500">
      Variant: {item.productVariant.weight}
    </p>
  </div>
</td>

                                  <td className="py-3">
                                    {item.quantity}
                                  </td>

                                  <td className="py-3">
                                    {formatMoney(
                                      item.price,
                                      order.currency
                                    )}
                                  </td>

                                  <td className="py-3 font-medium">
                                    {formatMoney(
                                      item.price *
                                        item.quantity,
                                      order.currency
                                    )}
                                  </td>

                                </tr>
                              )
                            )}

                          </tbody>

                        </table>

                      </div>
                    )}

                  </div>

                  {/* PAYMENTS */}

                  <div className="mt-6">

                    <h4 className="mb-3 font-medium">
                      💳 Payments
                    </h4>

                    {order.payments.length ===
                    0 ? (
                      <p className="text-sm text-gray-500">
                        No payments found.
                      </p>
                    ) : (
                      <div className="space-y-3">

                        {order.payments.map(
                          (payment) => (
                            <div
                              key={payment.id}
                              className="rounded-lg border p-4"
                            >

                              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                                <InfoItem
                                  label="Amount"
                                  value={formatMoney(
                                    payment.amount,
                                    payment.currency
                                  )}
                                />

                                <InfoItem
                                  label="Method"
                                  value={
                                    payment.paymentMethod
                                  }
                                />

                                <InfoItem
                                  label="Status"
                                  value={
                                    payment.paymentStatus
                                  }
                                />

                                <InfoItem
                                  label="Paid At"
                                  value={formatDateTime(
                                    payment.paidAt
                                  )}
                                />

                              </div>

                              {payment.transactionId && (
                                <p className="mt-3 text-xs text-gray-500">
                                  Transaction:{" "}
                                  {
                                    payment.transactionId
                                  }
                                </p>
                              )}

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>

                  {/* ADDRESS USED FOR ORDER */}

                  {order.address && (
                    <div className="mt-6 rounded-lg bg-gray-50 p-4">

                      <h4 className="mb-2 font-medium">
                        📍 Delivery Address
                      </h4>

                      <p className="text-sm">
                        {order.address.fullName}
                      </p>

                      <p className="text-sm text-gray-600">
                        {order.address.street},{" "}
                        {order.address.city}
                      </p>

                      <p className="text-sm text-gray-600">
                        {order.address.country}
                      </p>

                    </div>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </section>


{/* ===================================== */}
{/* CUSTOMER NOTES */}
{/* ===================================== */}

<section>

  <div className="mb-4 flex items-center justify-between">

    <h2 className="text-xl font-semibold">
      📝 Customer Notes
    </h2>

  </div>

  {!customer.notes || customer.notes.length === 0 ? (

    <div className="rounded-xl border bg-white p-6 text-gray-500">
      No notes found.
    </div>

  ) : (

    <div className="space-y-3">

      {customer.notes.map(
  (note: CustomerNote) => (

        <div
          key={note.id}
          className="rounded-xl border bg-white p-5 shadow-sm"
        >

          <div className="flex items-start justify-between gap-4">

            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {note.note}
            </p>

            <span className="shrink-0 text-xs text-gray-400">
              {formatDateTime(note.createdAt)}
            </span>

          </div>

        </div>

      ))}

    </div>

  )}

</section>

    </div>
  );
}

// ==========================================
// SMALL COMPONENTS
// ==========================================


function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
})


{
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}


function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="font-semibold">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function PaymentStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toUpperCase();
  
  const config =
    normalized === "PAID"
      ? {
          label: "Paid",
          className:
            "bg-green-100 text-green-700",
        }
      : normalized === "PARTIAL" ||
        normalized === "PARTIALLY_PAID"
      ? {
          label: "Partially Paid",
          className:
            "bg-yellow-100 text-yellow-700",
        }
      : normalized === "PENDING"
      ? {
          label: "Pending",
          className:
            "bg-orange-100 text-orange-700",
        }
      : normalized === "FAILED"
      ? {
          label: "Failed",
          className:
            "bg-red-100 text-red-700",
        }
      : {
          label: status,
          className:
            "bg-gray-100 text-gray-700",
        };
  
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function StatusBadge({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
      {label}
    </span>
  );
}