import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customerService } from "../../services/customer.service";
import type { Customer } from "../../types/customer.types";
import { orderService } from "../../services/order.service";

type AddressFormData = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

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

const initialFormData: AddressFormData = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  country: "Sri Lanka",
  isDefault: true,
};

function unwrap<T = any>(response: any): T {
  return (response?.data?.data ??
    response?.data?.customer ??
    response?.customer ??
    response?.data ??
    response) as T;
}

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export default function AddCustomerAddress() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] =
    useState<AddressFormData>(initialFormData);

  useEffect(() => {
    let cancelled = false;

    const loadCustomer = async () => {
      if (!customerId) {
        setError("Customer ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await customerService.getCustomerProfile(customerId);
        const customerData = unwrap<Customer>(response);

        if (!customerData?.id) {
          throw new Error("Customer data was not returned by the server.");
        }

        if (cancelled) return;

        setCustomer(customerData);
        setFormData((current) => ({
          ...current,
          fullName: customerData.fullName || "",
          phone: customerData.phone || "",
        }));
      } catch (loadError: any) {
        if (cancelled) return;
        setCustomer(null);
        setError(
          getErrorMessage(loadError, "Unable to load customer information.")
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerId) {
      setError("Customer ID is missing.");
      return;
    }

    if (saving) return;

    let addressSaved = false;

    try {
      setSaving(true);
      setError("");

      // 1. Save the address.
      const addressResponse = await customerService.addAddress(
        customerId,
        formData
      );
      const addressResult = unwrap<any>(addressResponse);
      addressSaved = true;

      // Prefer the ID returned by the address-create endpoint.
      let createdAddress: CustomerAddress | undefined =
        addressResult?.address ??
        addressResult?.createdAddress ??
        (addressResult?.id ? addressResult : undefined);

      // 2. If the API did not return the new address, reload the profile
      // and identify the matching address instead of blindly using the last one.
      if (!createdAddress?.id) {
        const profileResponse =
          await customerService.getCustomerProfile(customerId);
        const refreshedCustomer = unwrap<Customer>(profileResponse);

        const addresses = Array.isArray((refreshedCustomer as any)?.addresses)
          ? ((refreshedCustomer as any).addresses as CustomerAddress[])
          : [];

        createdAddress = addresses.find(
          (address) =>
            address.fullName === formData.fullName &&
            address.phone === formData.phone &&
            address.street === formData.street &&
            address.city === formData.city
        );

        if (refreshedCustomer?.id) setCustomer(refreshedCustomer);

        // Last-resort fallback for APIs that return no address ID and do not
        // expose the newly-created address fields consistently.
        if (!createdAddress?.id) {
          createdAddress =
            addresses.find((address) => address.isDefault) ??
            addresses[addresses.length - 1];
        }
      }

      if (!createdAddress?.id) {
        throw new Error(
          "Address may have been saved, but its ID could not be found. Please check the customer profile before trying again."
        );
      }

      // 3. Create a draft order for the address that was just added.
      // This follows the existing application flow.
      await orderService.createDraftOrder(customerId, createdAddress.id);

      // 4. Navigate back to the customer profile after both operations succeed.
      window.alert("Address added and draft order created successfully.");
      navigate(`/admin/customers/${customerId}`);
    } catch (submitError: any) {
      const detail = getErrorMessage(
        submitError,
        "An unexpected error occurred."
      );
      const message = addressSaved
        ? `The address was saved, but draft order creation did not complete. ${detail} Please return to the customer profile and check the address before trying again.`
        : `Unable to save the address. ${detail}`;
      setError(message);
      window.alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div
          className="flex items-center gap-3 rounded-xl border bg-white px-5 py-4 text-sm text-gray-600 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-700" />
          Loading customer...
        </div>
      </div>
    );
  }

  if (!customer || error === "Customer ID is missing.") {
    return (
      <main className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 sm:p-6"
          role="alert"
        >
          <h1 className="text-lg font-bold">Unable to Load Customer</h1>
          <p className="mt-2 break-words text-sm">
            {error || "Customer not found."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/customers")}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
          >
            Back to Customers
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-3 py-5 sm:px-6 sm:py-8 lg:py-10">
      <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(`/admin/customers/${customerId}`)}
            className="mb-3 inline-flex min-h-9 items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Customer Profile
          </button>
          <h1 className="break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Add Customer Address
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Add a delivery address for this customer.
          </p>
        </div>
      </div>

      {error && (
        <div
          className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
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

      <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Customer Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Name
            </p>
            <p className="mt-1 break-words text-sm font-medium text-gray-900">
              {customer.fullName || "N/A"}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Phone
            </p>
            <p className="mt-1 break-words text-sm font-medium text-gray-900">
              {customer.phone || "N/A"}
            </p>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Email
            </p>
            <p className="mt-1 break-all text-sm font-medium text-gray-900">
              {customer.email || "Not provided"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Address Details
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter the complete delivery address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Full name"
                className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                inputMode="tel"
                placeholder="Phone number"
                className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                required
                disabled={saving}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="street"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Street Address <span className="text-red-600">*</span>
              </label>
              <input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                autoComplete="street-address"
                placeholder="House number, street, village"
                className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                City / Town <span className="text-red-600">*</span>
              </label>
              <input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                autoComplete="address-level2"
                placeholder="City or town"
                className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="province"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Province
              </label>
              <input
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                autoComplete="address-level1"
                placeholder="Province"
                className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Postal Code
              </label>
              <input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="Postal code"
                className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Country <span className="text-red-600">*</span>
              </label>
              <input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                autoComplete="country-name"
                placeholder="Country"
                className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                required
                disabled={saving}
              />
            </div>
          </div>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              disabled={saving}
              className="h-4 w-4 rounded border-gray-300 accent-green-700 focus:ring-green-600"
            />
            <span className="text-sm font-medium text-gray-800">
              Set as default address
            </span>
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`/admin/customers/${customerId}`)}
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {saving ? "Saving address..." : "Save Address"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
