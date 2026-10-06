import { useEffect, useState } from "react";
import {
  CustomerCard,
  CustomerSummaryCards,
} from "../../components/admin/customer/CustomerCard";

import { customerService } from "../../services/customer.service";
import type { Customer } from "../../types/customer.types";
import { orderService } from "../../services/order.service";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CustomerNotes from "../../components/admin/customer/CustomerNotes";

interface CustomerProfile {
  customer: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    isActive: boolean;
    addresses: any[];
    orders: any[];
    notes?: any[];
  };
  totalOrders: number;
  totalSpent: number;
}

export default function CustomerSearch() {
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // ==========================================
  // LOAD CUSTOMER PROFILE
  // ==========================================

  const loadCustomer = async (customerId: string) => {
    try {
      setLoading(true);
      setNotFound(false);

      const profileData =
        await customerService.getCustomerProfile(customerId);

      console.log("CUSTOMER PROFILE =", profileData);

      const normalizedProfile: CustomerProfile = {
        customer: profileData?.customer ?? profileData,
        totalOrders: profileData?.totalOrders ?? 0,
        totalSpent: profileData?.totalSpent ?? 0,
      };

      setProfile(normalizedProfile);
      setCustomer(normalizedProfile.customer as Customer);
    } catch (error) {
      console.error("Load customer failed:", error);

      setCustomer(null);
      setProfile(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD CUSTOMER FROM URL
  // /admin/customers?customer=xxx
  // ==========================================

  useEffect(() => {
    const customerId = searchParams.get("customer");

    if (customerId) {
      loadCustomer(customerId);
    }
  }, [searchParams]);

  // ==========================================
  // LOAD CUSTOMER AFTER QUICK CREATE
  // ==========================================

  useEffect(() => {
    const customerId = location.state?.customerId;

    if (customerId) {
      loadCustomer(customerId);

      // Clear browser history state
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [location.state]);

  // ==========================================
  // SEARCH CUSTOMER BY PHONE
  // ==========================================

  const searchCustomer = async () => {
    if (!phone.trim()) {
      alert("Please enter customer phone number");
      return;
    }

    try {
      setLoading(true);
      setNotFound(false);

      const data = await customerService.search(phone);

      console.log("SEARCH CUSTOMER =", data);

      setCustomer(data);

      const profileData =
        await customerService.getCustomerProfile(data.id);

      console.log("PROFILE API =", profileData);

      const normalizedProfile: CustomerProfile = {
        customer: profileData?.customer ?? profileData,
        totalOrders: profileData?.totalOrders ?? 0,
        totalSpent: profileData?.totalSpent ?? 0,
      };

      setProfile(normalizedProfile);
    } catch (error) {
      console.error("Customer search failed:", error);

      setCustomer(null);
      setProfile(null);
      setNotFound(true);

      alert("Customer not found");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREATE DRAFT ORDER
  // ==========================================

  const createOrder = async () => {
    const addresses =
      profile?.customer?.addresses ?? [];

    if (addresses.length === 0) {
      alert("Customer address not found. Please add an address first.");
      return;
    }

    try {
      setLoading(true);

      const order =
        await orderService.createDraftOrder(
          profile!.customer.id,
          addresses[0].id
        );

      navigate(`/admin/order-builder/${order.id}`);
    } catch (error) {
      console.error("Create draft order failed:", error);
      alert("Unable to create draft order");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && !profile) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="rounded-lg border bg-white p-8 text-center shadow">
          <p className="text-lg font-semibold">
            Loading customer...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mx-auto max-w-3xl p-8">

      <h1 className="mb-6 text-3xl font-bold">
        Customer Search
      </h1>

      {/* SEARCH */}
      <div className="flex gap-3">
        <input
          className="flex-1 rounded border p-3"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchCustomer();
            }
          }}
        />

        <button
          type="button"
          onClick={searchCustomer}
          disabled={loading}
          className="rounded bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* CUSTOMER NOT FOUND */}
      {notFound && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">

          <p className="mb-3 text-sm text-gray-700">
            Customer not found. Create a new customer.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/customers/quick-create")
            }
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Create New Customer
          </button>

        </div>
      )}

      {/* CUSTOMER CARD */}
      {customer && (
        <div className="mt-6">
          <CustomerCard customer={customer} />
        </div>
      )}

      {/* PROFILE */}
      {profile && (
        <div className="mt-6 space-y-6">

          {/* DEBUG */}
          <div className="rounded bg-gray-100 p-4">
            <details>
              <summary className="cursor-pointer font-bold text-gray-700">
                Debug Profile JSON
              </summary>

              <pre className="mt-2 overflow-auto text-xs">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </details>
          </div>

          {/* SUMMARY */}
          <CustomerSummaryCards
            totalOrders={profile.totalOrders ?? 0}
            totalSpent={profile.totalSpent ?? 0}
            totalAddresses={
              profile.customer?.addresses?.length ?? 0
            }
            totalNotes={
              profile.customer?.notes?.length ?? 0
            }
          />

          {/* CUSTOMER INFORMATION */}
          <div className="rounded-lg border bg-white p-6 shadow">

            <h2 className="mb-4 text-xl font-bold">
              Customer Information
            </h2>

            <div className="space-y-2">

              <p>
                <strong>Name:</strong>{" "}
                {profile.customer?.fullName || "N/A"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {profile.customer?.phone || "N/A"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {profile.customer?.email || "N/A"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {profile.customer?.isActive
                  ? "Active"
                  : "Inactive"}
              </p>

            </div>
          </div>

          {/* ADDRESSES */}
          <div className="rounded-lg border bg-white p-6 shadow">

            <div className="mb-4 flex items-center justify-between">

              <h2 className="text-xl font-bold">
                Addresses
              </h2>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/admin/customers/${profile.customer.id}/add-address`
                  )
                }
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Add Address
              </button>

            </div>

            {(!profile.customer?.addresses ||
              profile.customer.addresses.length === 0) ? (

              <div className="rounded-lg border border-dashed p-6 text-center">

                <p className="mb-4 text-gray-500">
                  No Address Found
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/customers/${profile.customer.id}/add-address`
                    )
                  }
                  className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
                >
                  Add Address First
                </button>

              </div>

            ) : (

              <div className="space-y-4">

                {profile.customer.addresses.map(
                  (address: any) => (

                    <div
                      key={address.id}
                      className="rounded border p-4"
                    >

                      {address.isDefault && (
                        <span className="rounded bg-green-600 px-2 py-1 text-xs text-white">
                          Default
                        </span>
                      )}

                      <p className="mt-2 font-semibold">
                        {address.fullName}
                      </p>

                      <p>{address.phone}</p>
                      <p>{address.street}</p>
                      <p>{address.city}</p>
                      <p>{address.province}</p>
                      <p>{address.postalCode}</p>
                      <p>{address.country}</p>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* RECENT ORDERS */}
          <div className="rounded-lg border bg-white p-6 shadow">

            <h2 className="mb-4 text-xl font-bold">
              Recent Orders
            </h2>

            {(!profile.customer?.orders ||
              profile.customer.orders.length === 0) ? (

              <p>No Orders Yet</p>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full border-collapse">

                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">
                        Order ID
                      </th>

                      <th className="p-2 text-left">
                        Status
                      </th>

                      <th className="p-2 text-left">
                        Payment
                      </th>

                      <th className="p-2 text-left">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {profile.customer.orders.map(
                      (order: any) => (

                        <tr
                          key={order.id}
                          className="border-b"
                        >

                          <td className="p-2">
                            {order.id?.slice(0, 8)}...
                          </td>

                          <td className="p-2">
                            {order.status}
                          </td>

                          <td className="p-2">
                            {order.paymentStatus}
                          </td>

                          <td className="p-2">
                            {order.currency}{" "}
                            {order.totalFinal}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* STATISTICS */}
          <div className="rounded-lg border bg-white p-6 shadow">

            <h2 className="mb-4 text-xl font-bold">
              Statistics
            </h2>

            <p>
              <strong>Total Orders:</strong>{" "}
              {profile.totalOrders ?? 0}
            </p>

            <p>
              <strong>Total Spent:</strong>{" "}
              {profile.totalSpent ?? 0}
            </p>

          </div>

          {/* NOTES */}
          <CustomerNotes
            customerId={profile.customer.id}
          />

          {/* CREATE ORDER */}
          <button
            type="button"
            onClick={createOrder}
            disabled={
              loading ||
              !profile.customer?.addresses?.length
            }
            className={`w-full rounded-lg py-4 text-lg font-semibold text-white ${
              profile.customer?.addresses?.length
                ? "bg-green-700 hover:bg-green-800"
                : "cursor-not-allowed bg-gray-400"
            }`}
          >
            {profile.customer?.addresses?.length
              ? "Create Draft Order"
              : "Add Address First"}
          </button>

        </div>
      )}

    </div>
  );
}