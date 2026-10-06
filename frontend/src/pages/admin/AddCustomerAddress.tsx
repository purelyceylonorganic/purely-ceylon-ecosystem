import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customerService } from "../../services/customer.service";
import type { Customer } from "../../types/customer.types";
import { orderService } from "../../services/order.service";


export default function AddCustomerAddress() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Sri Lanka",
    isDefault: true,
  });

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

        console.log("Loading customer:", customerId);

        const profile =
  await customerService.getCustomerProfile(customerId);

        console.log("Customer Profile Response:", profile);

        // Backend may return either:
        // { customer: {...} }
        // or directly {...}
        const customerData = profile?.customer ?? profile?.data?.customer ?? profile?.data ?? profile;

        if (!customerData) {
          throw new Error("Customer data not found");
        }

        setCustomer(customerData);

        // Fill customer information into address form
        setFormData((previous) => ({
          ...previous,
          fullName: customerData.fullName || "",
          phone: customerData.phone || "",
        }));
      } catch (error: any) {
        console.error("Failed to load customer:", error);

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load customer";

        setError(message);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [customerId]);

  // ==========================================
  // FORM CHANGE
  // ==========================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (!customerId) {
    alert("Customer ID is missing");
    return;
  }

  try {
    setSaving(true);
    setError("");

    // ==========================================
    // 1. SAVE CUSTOMER ADDRESS
    // ==========================================

    const addressResponse = await customerService.addAddress(
      customerId,
      formData
    );

    console.log("Address Created:", addressResponse);

    // ==========================================
    // 2. GET UPDATED CUSTOMER PROFILE
    // ==========================================

    const profile =
      await customerService.getCustomerProfile(customerId);

    console.log("Updated Customer Profile:", profile);

    const customerData =
      profile?.customer ??
      profile?.data?.customer ??
      profile?.data ??
      profile;

    if (!customerData) {
      throw new Error(
        "Customer profile could not be loaded"
      );
    }

    // ==========================================
    // 3. FIND THE NEW / DEFAULT ADDRESS
    // ==========================================

    const addresses = Array.isArray(customerData.addresses)
      ? customerData.addresses
      : [];

    const defaultAddress =
      addresses.find(
        (address: any) =>
          address.isDefault === true
      ) ||
      addresses[addresses.length - 1];

    if (!defaultAddress?.id) {
      throw new Error(
        "Address was created but address ID could not be found"
      );
    }

    console.log(
      "Selected Address:",
      defaultAddress
    );

    // ==========================================
    // 4. CREATE DRAFT ORDER
    // ==========================================

    const draftOrder =
      await orderService.createDraftOrder(
        customerId,
        defaultAddress.id
      );

    console.log(
      "Draft Order Created:",
      draftOrder
    );

    if (!draftOrder?.id) {
      throw new Error(
        "Draft order was created but order ID was not returned"
      );
    }

    // ==========================================
    // 5. SUCCESS
    // ==========================================

    alert(
      "Address Added Successfully."
    );

    // ==========================================
    // 6. GO TO ORDER BUILDER
    // ==========================================

    navigate(
      `/admin/customers/${customerId}`
    );

  } catch (error: any) {

    console.error(
      "Address / Draft Order creation error:",
      error
    );

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to create address or draft order";

    setError(message);

    alert(message);

  } finally {
    setSaving(false);
  }
};

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="p-10">
        <p>Loading customer...</p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error || !customer) {
    return (
      <div className="p-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-bold text-red-700">
            Unable to Load Customer
          </h2>

          <p className="mt-2 text-red-600">
            {error || "Customer not found"}
          </p>

          <button
            onClick={() => navigate("/admin/customers")}
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
    <div className="mx-auto max-w-3xl p-8">

      <h1 className="mb-6 text-3xl font-bold">
        Add Customer Address
      </h1>

      {/* Customer Information */}
      <div className="mb-6 rounded-lg border bg-gray-50 p-5">
        <h2 className="mb-3 text-lg font-bold">
          Customer
        </h2>

        <p>
          <strong>Name:</strong>{" "}
          {customer.fullName || "N/A"}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {customer.phone || "N/A"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {customer.email || "N/A"}
        </p>
      </div>

      {/* Address Form */}
      <div className="rounded-lg border bg-white p-6 shadow">

        <h2 className="mb-5 text-xl font-bold">
          Address Details
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full rounded border p-3"
            required
          />

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full rounded border p-3"
            required
          />

          <input
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Street Address"
            className="w-full rounded border p-3"
            required
          />

          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="w-full rounded border p-3"
            required
          />

          <input
            name="province"
            value={formData.province}
            onChange={handleChange}
            placeholder="Province"
            className="w-full rounded border p-3"
          />

          <input
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Postal Code"
            className="w-full rounded border p-3"
          />

          <input
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className="w-full rounded border p-3"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData((previous) => ({
                  ...previous,
                  isDefault: e.target.checked,
                }))
              }
            />

            <span>Default Address</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Address"}
          </button>

        </form>
      </div>
    </div>
  );
}