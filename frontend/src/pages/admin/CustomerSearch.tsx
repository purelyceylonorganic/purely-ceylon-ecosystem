import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  CustomerCard,
  CustomerSummaryCards,
} from "../../components/admin/customer/CustomerCard";
import CustomerNotes from "../../components/admin/customer/CustomerNotes";
import { customerService } from "../../services/customer.service";
import { orderService } from "../../services/order.service";
import type { Customer } from "../../types/customer.types";

type CustomerAddress = {
  id: string;
  fullName?: string;
  phone?: string;
  street?: string;
  city?: string;
  province?: string | null;
  postalCode?: string | null;
  country?: string;
  isDefault?: boolean;
};

type CustomerOrder = {
  id: string;
  status?: string;
  paymentStatus?: string;
  currency?: string;
  totalFinal?: number | string;
  createdAt?: string;
};

type CustomerProfileData = Customer & {
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
  notes?: Array<{ id: string; note: string; createdAt?: string }>;
  customerNotes?: Array<{ id: string; note: string; createdAt?: string }>;
};

type CustomerProfileResponse = {
  customer: CustomerProfileData;
  totalOrders: number;
  totalSpent: number;
};

function normalizeProfile(response: any): CustomerProfileResponse {
  const root = response?.data?.data ?? response?.data ?? response;
  const customerData =
    root?.customer ?? root?.data?.customer ?? root?.data ?? root;

  return {
    customer: {
      ...customerData,
      addresses: Array.isArray(customerData?.addresses)
        ? customerData.addresses
        : [],
      orders: Array.isArray(customerData?.orders) ? customerData.orders : [],
      notes: Array.isArray(customerData?.notes) ? customerData.notes : [],
      customerNotes: Array.isArray(customerData?.customerNotes)
        ? customerData.customerNotes
        : [],
    },
    totalOrders: Number(root?.totalOrders ?? customerData?.orders?.length ?? 0),
    totalSpent: Number(root?.totalSpent ?? 0),
  };
}

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function formatMoney(value: number | string | undefined, currency = "LKR") {
  const amount = Number(value ?? 0);
  return `${currency} ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function CustomerSearch() {
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [profile, setProfile] = useState<CustomerProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const loadCustomer = useCallback(async (customerId: string) => {
    try {
      setLoading(true);
      setError("");
      setNotFound(false);

      const response = await customerService.getCustomerProfile(customerId);
      const normalized = normalizeProfile(response);

      if (!normalized.customer?.id) {
        throw new Error("Customer profile was not returned by the server.");
      }

      setProfile(normalized);
      setCustomer(normalized.customer as Customer);
    } catch (loadError: any) {
      setCustomer(null);
      setProfile(null);
      setNotFound(true);
      setError(getErrorMessage(loadError, "Unable to load customer profile."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Support direct links such as /admin/customers?customer=<id>.
  useEffect(() => {
    const customerId = searchParams.get("customer");
    if (customerId) void loadCustomer(customerId);
  }, [searchParams, loadCustomer]);

  // Support returning from Quick Create with a customerId in navigation state.
  useEffect(() => {
    const customerId = (location.state as { customerId?: string } | null)
      ?.customerId;

    if (customerId) {
      void loadCustomer(customerId);
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );
    }
  }, [location.state, loadCustomer]);

  const searchCustomer = async () => {
    const searchValue = phone.trim();

    if (!searchValue) {
      setError("Please enter a customer phone number.");
      setNotFound(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setNotFound(false);
      setProfile(null);
      setCustomer(null);

      const result = await customerService.search(searchValue);
      const foundCustomer = result?.data?.customer ?? result?.customer ?? result?.data ?? result;

      if (!foundCustomer?.id) {
        throw new Error("Customer not found.");
      }

      const response = await customerService.getCustomerProfile(foundCustomer.id);
      const normalized = normalizeProfile(response);

      if (!normalized.customer?.id) {
        throw new Error("Customer profile was not returned by the server.");
      }

      setCustomer(normalized.customer as Customer);
      setProfile(normalized);
    } catch (searchError: any) {
      setCustomer(null);
      setProfile(null);
      setNotFound(true);
      setError(getErrorMessage(searchError, "Customer not found."));
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    const customerData = profile?.customer;

    if (!customerData?.id) {
      setError("Load a customer profile before creating a draft order.");
      return;
    }

    const addresses = customerData.addresses ?? [];

    if (addresses.length === 0) {
      setError("Customer address not found. Please add an address first.");
      return;
    }

    // Prefer the explicitly marked default address; otherwise use the first
    // available address to preserve the existing draft-order workflow.
    const selectedAddress =
      addresses.find((address) => address.isDefault) ?? addresses[0];

    if (!selectedAddress?.id) {
      setError("No valid customer address ID was found.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const order = await orderService.createDraftOrder(
        customerData.id,
        selectedAddress.id
      );

      if (!order?.id) {
        throw new Error("Draft order was created but no order ID was returned.");
      }

      navigate(`/admin/order-builder/${order.id}`);
    } catch (orderError: any) {
      setError(getErrorMessage(orderError, "Unable to create draft order."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <header className="mb-5 sm:mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Customer Search
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Search by phone number to view customer details and create a draft order.
        </p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
        <form
          className="flex min-w-0 flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void searchCustomer();
          }}
        >
          <label className="sr-only" htmlFor="customer-phone-search">
            Customer phone number
          </label>
          <input
            id="customer-phone-search"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="min-h-12 min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-100"
            placeholder="Enter phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-28"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </section>

      {error && (
        <div
          className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <p className="min-w-0 break-words">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded px-2 py-1 font-semibold hover:bg-red-100"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {loading && !profile && (
        <div className="mt-5 rounded-xl border bg-white p-6 text-center text-sm text-gray-600 shadow-sm" role="status">
          Loading customer profile...
        </div>
      )}

      {notFound && (
        <section className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:p-5">
          <h2 className="font-semibold text-gray-900">Customer not found</h2>
          <p className="mt-1 text-sm text-gray-600">
            Check the phone number or create a new customer.
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/customers/quick-create")}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            Create New Customer
          </button>
        </section>
      )}

      {customer && (
        <section className="mt-5 min-w-0">
          <CustomerCard customer={customer} />
        </section>
      )}

      {profile && (
        <div className="mt-5 min-w-0 space-y-5 sm:mt-6 sm:space-y-6">
          <CustomerSummaryCards
            totalOrders={profile.totalOrders}
            totalSpent={profile.totalSpent}
            totalAddresses={profile.customer.addresses.length}
            totalNotes={
              profile.customer.notes?.length ??
              profile.customer.customerNotes?.length ??
              0
            }
          />

          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
              Customer Information
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Name</dt>
                <dd className="mt-1 break-words text-sm font-medium text-gray-900">
                  {profile.customer.fullName || "N/A"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</dt>
                <dd className="mt-1 break-words text-sm font-medium text-gray-900">
                  {profile.customer.phone || "N/A"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</dt>
                <dd className="mt-1 break-all text-sm font-medium text-gray-900">
                  {profile.customer.email || "Not provided"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    profile.customer.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {profile.customer.isActive ? "Active" : "Inactive"}
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Addresses</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {profile.customer.addresses.length} saved address
                  {profile.customer.addresses.length === 1 ? "" : "es"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/customers/${profile.customer.id}/add-address`)
                }
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
              >
                + Add Address
              </button>
            </div>

            {profile.customer.addresses.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-5 text-center sm:p-7">
                <p className="text-sm text-gray-500">No address found.</p>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/admin/customers/${profile.customer.id}/add-address`)
                  }
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                >
                  Add Address First
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {profile.customer.addresses.map((address) => (
                  <article
                    key={address.id}
                    className={`min-w-0 rounded-lg border p-4 ${
                      address.isDefault
                        ? "border-green-300 bg-green-50/50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 break-words font-semibold text-gray-900">
                        {address.fullName || "Address"}
                      </h3>
                      {address.isDefault && (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="mt-3 space-y-1 break-words text-sm text-gray-600">
                      {address.phone && <p>{address.phone}</p>}
                      {address.street && <p>{address.street}</p>}
                      <p>
                        {[address.city, address.province, address.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {address.country && <p>{address.country}</p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Recent Orders</h2>
              <p className="mt-1 text-sm text-gray-500">
                {profile.customer.orders.length} order
                {profile.customer.orders.length === 1 ? "" : "s"}
              </p>
            </div>

            {profile.customer.orders.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                No orders yet.
              </p>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {profile.customer.orders.map((order) => (
                    <article key={order.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="break-all text-sm font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {order.status || "Unknown"}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Payment</p>
                          <p className="mt-1 break-words text-gray-800">{order.paymentStatus || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="mt-1 break-words font-medium text-gray-900">
                            {formatMoney(order.totalFinal, order.currency || "LKR")}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[600px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                        <th className="whitespace-nowrap p-3 font-semibold">Order ID</th>
                        <th className="whitespace-nowrap p-3 font-semibold">Status</th>
                        <th className="whitespace-nowrap p-3 font-semibold">Payment</th>
                        <th className="whitespace-nowrap p-3 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.customer.orders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0">
                          <td className="whitespace-nowrap p-3 font-medium text-gray-800">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="whitespace-nowrap p-3">{order.status || "—"}</td>
                          <td className="whitespace-nowrap p-3">{order.paymentStatus || "—"}</td>
                          <td className="whitespace-nowrap p-3 text-right">
                            {formatMoney(order.totalFinal, order.currency || "LKR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <CustomerNotes customerId={profile.customer.id} />

          <section className="sticky bottom-2 z-10 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0">
            <button
              type="button"
              onClick={() => void createOrder()}
              disabled={loading || profile.customer.addresses.length === 0}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading
                ? "Creating Draft Order..."
                : profile.customer.addresses.length
                  ? `Create Draft Order${profile.customer.addresses.some((address) => address.isDefault) ? " (Default Address)" : ""}`
                  : "Add Address First"}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
