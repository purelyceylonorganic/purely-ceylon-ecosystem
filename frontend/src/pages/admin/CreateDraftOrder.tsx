import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customerService } from "../../services/customer.service";
import { orderService } from "../../services/order.service";

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

interface Customer {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  addresses: Address[];
}

export default function CreateDraftOrder() {
  const { customerId } = useParams<{
    customerId: string;
  }>();

  const navigate = useNavigate();

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD CUSTOMER
  // ==========================================

  useEffect(() => {
    const loadCustomer = async () => {
      if (!customerId) {
        setError("Customer ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await customerService.getCustomerProfile(
            customerId
          );

        if (!data) {
          throw new Error(
            "Customer not found"
          );
        }

        setCustomer(data);

        // Automatically select default address
        const defaultAddress =
          data.addresses?.find(
            (address: Address) =>
              address.isDefault
          );

        if (defaultAddress) {
          setSelectedAddressId(
            defaultAddress.id
          );
        } else if (
          data.addresses?.length > 0
        ) {
          setSelectedAddressId(
            data.addresses[0].id
          );
        }
      } catch (error: any) {
        console.error(
          "Load Customer Error:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load customer"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [customerId]);

  // ==========================================
  // CREATE DRAFT ORDER
  // ==========================================

  const handleCreateDraftOrder =
    async () => {
      if (!customerId) {
        alert("Customer ID is missing");
        return;
      }

      if (!selectedAddressId) {
        alert(
          "Please select a shipping address."
        );
        return;
      }

      try {
        setCreating(true);
        setError("");

        const draftOrder =
          await orderService.createDraftOrder(
            customerId,
            selectedAddressId
          );

        console.log(
          "Draft Order Created:",
          draftOrder
        );

        navigate(
          `/admin/order-builder/${draftOrder.id}`
        );
      } catch (error: any) {
        console.error(
          "Create Draft Order Error:",
          error
        );

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unable to create draft order";

        setError(message);
        alert(message);
      } finally {
        setCreating(false);
      }
    };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="p-8">
        Loading customer...
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (!customer) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-bold text-red-700">
            Unable to Load Customer
          </h2>

          <p className="mt-2 text-red-600">
            {error || "Customer not found"}
          </p>

          <button
            onClick={() =>
              navigate("/admin/customers")
            }
            className="mt-5 rounded bg-green-700 px-5 py-3 text-white"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 space-y-5 px-3 py-5 sm:space-y-6 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div>
        <button
          onClick={() =>
            navigate(
              `/admin/customers/${customer.id}`
            )
          }
          className="mb-3 text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Customer
        </button>

        <h1 className="text-3xl font-bold">
          Create Draft Order
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Select a shipping address for this order.
        </p>
      </div>

      {/* CUSTOMER */}

      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">

        <h2 className="mb-4 text-xl font-semibold">
          Customer
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div>
            <p className="text-xs uppercase text-gray-400">
              Name
            </p>

            <p className="mt-1 font-medium">
              {customer.fullName}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-400">
              Phone
            </p>

            <p className="mt-1 font-medium">
              {customer.phone || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-400">
              Email
            </p>

            <p className="mt-1 font-medium">
              {customer.email || "-"}
            </p>
          </div>

        </div>
      </div>

      {/* ADDRESS */}

      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <h2 className="text-xl font-semibold">
            Shipping Address
          </h2>

          <button
            onClick={() =>
              navigate(
                `/admin/customers/${customer.id}/add-address`
              )
            }
            className="w-full rounded-lg border px-4 py-3 text-sm font-medium hover:bg-gray-50 sm:w-auto"
          >
            + Add Address
          </button>

        </div>

        {customer.addresses.length === 0 ? (

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5">

            <p className="font-medium text-yellow-800">
              No address found.
            </p>

            <p className="mt-1 text-sm text-yellow-700">
              Please add a customer address before
              creating a draft order.
            </p>

            <button
              onClick={() =>
                navigate(
                  `/admin/customers/${customer.id}/add-address`
                )
              }
              className="mt-4 rounded bg-green-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Add Address
            </button>

          </div>

        ) : (

          <div className="space-y-4">

            {customer.addresses.map(
              (address) => (

                <label
                  key={address.id}
                  className={`block cursor-pointer rounded-xl border p-5 ${
                    selectedAddressId ===
                    address.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >

                  <div className="flex gap-4">

                    <input
                      type="radio"
                      name="shippingAddress"
                      value={address.id}
                      checked={
                        selectedAddressId ===
                        address.id
                      }
                      onChange={() =>
                        setSelectedAddressId(
                          address.id
                        )
                      }
                      className="mt-1"
                    />

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="font-semibold">
                          {address.fullName}
                        </p>

                        {address.isDefault && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            Default
                          </span>
                        )}

                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        {address.phone}
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

                  </div>

                </label>
              )
            )}

          </div>
        )}

      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ACTION */}

      {customer.addresses.length > 0 && (

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            onClick={() =>
              navigate(
                `/admin/customers/${customer.id}`
              )
            }
            className="w-full rounded-lg border px-6 py-3 font-medium hover:bg-gray-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateDraftOrder}
            disabled={
              creating ||
              !selectedAddressId
            }
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating
              ? "Creating..."
              : "Create Draft Order"}
          </button>

        </div>

      )}

    </div>
  );
}