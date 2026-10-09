import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserPlus,
  MapPin,
  Phone,
  Route as RouteIcon,
  Milk,
  CalendarDays,
  Eye,
} from "lucide-react";

import { customerService } from "../../../services/customer.service";

interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string | null;
  street: string;
  city: string;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isDefault?: boolean;
}

interface LastOrder {
  id: string;
  date: string;
  paymentStatus: string;
  paidAmount: number;
  balance: number;
  paymentMethod?: string | null;
  shippingStatus?: string | null;
  status: string;
  total: number;
  currency: string;
}

interface Customer {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;

  isActive: boolean;
  isVerified: boolean;

  createdAt: string;

  address: CustomerAddress | null;
  addressCount: number;
  orderCount: number;

  lastOrder: LastOrder | null;

  deliveryRoute: string | null;
  dailyQuantity: number | null;
  lastDelivery: string | null;
}

export default function CustomerList() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD CUSTOMERS
  // ==========================================

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await customerService.getCustomers(
        search,
        status
      );

      setCustomers(response?.data || []);
    } catch (error) {
      console.error("Customer List Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD WHEN STATUS CHANGES
  // ==========================================

  useEffect(() => {
    loadCustomers();
  }, [status]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    loadCustomers();
  };

  // ==========================================
  // ADDRESS DISPLAY
  // ==========================================

  const getAddress = (customer: Customer) => {
    if (!customer.address) {
      return "No address";
    }

    const address = customer.address;

    return [
      address.street,
      address.city,
      address.province,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // ==========================================
  // PAYMENT DISPLAY
  // ==========================================

  const getPaymentStatus = (customer: Customer) => {
    const order = customer.lastOrder;

    if (!order) {
      return {
        label: "No Orders",
        className: "bg-slate-100 text-slate-600",
      };
    }

    if (
      order.paymentStatus === "PAID" ||
      Number(order.balance) <= 0
    ) {
      return {
        label: "Paid",
        className: "bg-green-100 text-green-700",
      };
    }

    return {
      label: "Pending",
      className: "bg-red-100 text-red-700",
    };
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date: string | null) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-GB");
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="w-full min-w-0 space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customer Management
          </h1>

          <p className="text-sm text-slate-500">
            Manage your customers and delivery information.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/admin/customers/quick-create")
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0E4B32] px-4 py-3 text-white hover:bg-[#0b3d29] sm:w-auto"
        >
          <UserPlus size={18} />

          Add Customer
        </button>

      </div>

      {/* ==========================================
          SEARCH + FILTER
      ========================================== */}

      <div className="rounded-xl border bg-white p-4 shadow-sm">

        <form
          onSubmit={handleSearch}
          className="flex min-w-0 flex-col gap-3 sm:flex-row"
        >

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name, phone or email..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-[#0E4B32]"
            />

          </div>

          {/* Status */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none sm:w-auto"
          >
            <option value="ALL">
              All Customers
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>

          {/* Search Button */}

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800 sm:w-auto"
          >
            Search
          </button>

        </form>

      </div>

      {/* ==========================================
          CUSTOMER TABLE
      ========================================== */}

      <div className="w-full min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No customers found.
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1250px]">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Customer
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Phone
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Address
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Route
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Daily Quantity
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Payment
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Last Delivery
                    </th>
                    <th className="px-5 py-4 text-right text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {customers.map((customer) => {
                    const payment = getPaymentStatus(customer);

                    return (
                      <tr
                        key={customer.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {customer.fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {customer.email || "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Phone size={15} className="shrink-0 text-slate-400" />
                            {customer.phone || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex max-w-[240px] items-start gap-2 text-sm text-slate-600">
                            <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
                            <span className="break-words">
                              {getAddress(customer)}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <RouteIcon size={15} className="shrink-0 text-slate-400" />
                            {customer.deliveryRoute || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Milk size={16} className="shrink-0 text-slate-400" />
                            {customer.dailyQuantity ?? "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${payment.className}`}
                            >
                              {payment.label}
                            </span>

                            {customer.lastOrder &&
                              Number(customer.lastOrder.balance) > 0 && (
                                <span className="text-xs text-red-600">
                                  Balance: {customer.lastOrder.currency}{" "}
                                  {Number(
                                    customer.lastOrder.balance
                                  ).toLocaleString()}
                                </span>
                              )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {customer.isActive ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays size={15} className="shrink-0 text-slate-400" />
                            {formatDate(customer.lastDelivery)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/customers/${customer.id}/draft-order`
                                )
                              }
                              className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                              + Draft Order
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/customers/${customer.id}`)
                              }
                              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <Eye size={15} />
                              View Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CUSTOMER CARDS */}
            <div className="space-y-4 p-3 md:hidden">
              {customers.map((customer) => {
                const payment = getPaymentStatus(customer);

                return (
                  <div
                    key={customer.id}
                    className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <h3 className="break-words font-bold text-slate-900">
                      {customer.fullName}
                    </h3>

                    <p className="mt-1 break-all text-sm text-slate-500">
                      {customer.email || "No email"}
                    </p>

                    <div className="mt-3 space-y-3 text-sm">
                      <p className="flex gap-2">
                        <Phone size={16} className="shrink-0 text-slate-400" />
                        <span className="break-words">
                          {customer.phone || "-"}
                        </span>
                      </p>

                      <p className="flex gap-2">
                        <MapPin size={16} className="shrink-0 text-slate-400" />
                        <span className="break-words">
                          {getAddress(customer)}
                        </span>
                      </p>

                      <p>
                        <span className="font-medium">Route:</span>{" "}
                        {customer.deliveryRoute || "-"}
                      </p>

                      <p>
                        <span className="font-medium">Daily Quantity:</span>{" "}
                        {customer.dailyQuantity ?? "-"}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">Payment:</span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.className}`}
                        >
                          {payment.label}
                        </span>
                      </div>

                      {customer.lastOrder &&
                        Number(customer.lastOrder.balance) > 0 && (
                          <p className="break-words text-red-600">
                            <span className="font-medium">Balance:</span>{" "}
                            {customer.lastOrder.currency}{" "}
                            {Number(
                              customer.lastOrder.balance
                            ).toLocaleString()}
                          </p>
                        )}

                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        {customer.isActive ? "Active" : "Inactive"}
                      </p>

                      <p>
                        <span className="font-medium">Last Delivery:</span>{" "}
                        {formatDate(customer.lastDelivery)}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/customers/${customer.id}/draft-order`
                          )
                        }
                        className="w-full rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        + Draft Order
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/customers/${customer.id}`)
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <Eye size={16} />
                        View Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}