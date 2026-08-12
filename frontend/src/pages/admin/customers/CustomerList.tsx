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
    <div className="space-y-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex items-center justify-between">

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
          className="flex items-center gap-2 rounded-lg bg-[#0E4B32] px-4 py-2.5 text-white hover:bg-[#0b3d29]"
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
          className="flex flex-col gap-3 md:flex-row"
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
            className="rounded-lg border border-slate-300 px-4 py-2.5 outline-none"
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
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800"
          >
            Search
          </button>

        </form>

      </div>

      {/* ==========================================
          CUSTOMER TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        {loading ? (

          <div className="p-10 text-center text-slate-500">
            Loading customers...
          </div>

        ) : customers.length === 0 ? (

          <div className="p-10 text-center text-slate-500">
            No customers found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1250px]">

              {/* ==========================================
                  HEADER
              ========================================== */}

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
                    Profile
                  </th>

                </tr>

              </thead>

              {/* ==========================================
                  BODY
              ========================================== */}

              <tbody className="divide-y">

                {customers.map((customer) => {

                  const payment =
                    getPaymentStatus(customer);

                  return (

                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50"
                    >

                      {/* ==================================
                          CUSTOMER
                      ================================== */}

                      <td className="px-5 py-4">

                        <div>

                          <p className="font-semibold text-slate-900">
                            {customer.fullName}
                          </p>

                          <p className="text-xs text-slate-500">
                            {customer.email || "No email"}
                          </p>

                        </div>

                      </td>

                      {/* ==================================
                          PHONE
                      ================================== */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-700">

                          <Phone
                            size={15}
                            className="text-slate-400"
                          />

                          {customer.phone || "-"}

                        </div>

                      </td>

                      {/* ==================================
                          ADDRESS
                      ================================== */}

                      <td className="px-5 py-4">

                        <div className="flex max-w-[240px] items-start gap-2 text-sm text-slate-600">

                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />

                          <span className="truncate">
                            {getAddress(customer)}
                          </span>

                        </div>

                      </td>

                      {/* ==================================
                          ROUTE
                      ================================== */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm">

                          <RouteIcon
                            size={15}
                            className="text-slate-400"
                          />

                          {customer.deliveryRoute || "-"}

                        </div>

                      </td>

                      {/* ==================================
                          DAILY QUANTITY
                      ================================== */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm">

                          <Milk
                            size={16}
                            className="text-slate-400"
                          />

                          {customer.dailyQuantity
                            ? `${customer.dailyQuantity}`
                            : "-"}

                        </div>

                      </td>

                      {/* ==================================
                          PAYMENT
                      ================================== */}

                      <td className="px-5 py-4">

                        <div className="flex flex-col gap-1">

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${payment.className}`}
                          >
                            {payment.label}
                          </span>

                          {customer.lastOrder &&
                            Number(customer.lastOrder.balance) > 0 && (
                              <span className="text-xs text-red-600">
                                Balance:{" "}
                                {customer.lastOrder.currency}{" "}
                                {Number(
                                  customer.lastOrder.balance
                                ).toLocaleString()}
                              </span>
                            )}

                        </div>

                      </td>

                      {/* ==================================
                          STATUS
                      ================================== */}

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

                      {/* ==================================
                          LAST DELIVERY
                      ================================== */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />

                          {formatDate(
                            customer.lastDelivery
                          )}

                        </div>

                      </td>

                      {/* ==================================
                          PROFILE
                      ================================== */}

                      <td className="px-5 py-4 text-right">

                        <button
                          onClick={() =>
                            navigate(
                              `/admin/customers/${customer.id}`
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >

                          <Eye size={15} />

                          View Profile

                        </button>

                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}