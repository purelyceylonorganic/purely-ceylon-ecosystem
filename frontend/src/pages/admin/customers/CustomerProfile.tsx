import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customerService } from "../../../services/customer.service";

// ==========================================
// TYPES
// ==========================================

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
  updatedAt?: string | null;

  addresses: Address[];
  orders: Order[];
  customerNotes: CustomerNote[];
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ==========================================
  // CUSTOMER STATE
  // ==========================================

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // NOTE STATE
  // ==========================================

  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [editingNote, setEditingNote] =
    useState<CustomerNote | null>(null);

  const [savingNote, setSavingNote] = useState(false);

  const [deletingNoteId, setDeletingNoteId] =
    useState<string | null>(null);

  // ==========================================
  // ADDRESS STATE
  // ==========================================

  const [editingAddress, setEditingAddress] =
    useState<Address | null>(null);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [addressActionLoading, setAddressActionLoading] =
    useState<string | null>(null);

  // ==========================================
  // LOAD CUSTOMER
  // ==========================================

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Customer ID is missing");
      return;
    }

    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    if (!id) {
      setError("Customer ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await customerService.getCustomerProfile(id);

      const customerData =
        response?.data ?? response;

      if (!customerData) {
        throw new Error("Customer data not found");
      }

      setCustomer({
        ...customerData,
        addresses: customerData.addresses ?? [],
        orders: customerData.orders ?? [],
        customerNotes:
          customerData.notes ??
          customerData.customerNotes ??
          [],
      });
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

      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ADD CUSTOMER NOTE
  // ==========================================

  const handleAddNote = async () => {
    if (!id) {
      setError("Customer ID is missing");
      return;
    }

    const note = noteText.trim();

    if (!note) {
      alert("Please enter a note.");
      return;
    }

    try {
      setAddingNote(true);

      const response =
        await customerService.createCustomerNote(
          id,
          note
        );

      const newNote =
        response?.data ?? response;

      setCustomer((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          customerNotes: [
            newNote,
            ...prev.customerNotes,
          ],
        };
      });

      setNoteText("");
    } catch (error: any) {
      console.error(
        "Add Customer Note Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add customer note"
      );
    } finally {
      setAddingNote(false);
    }
  };

  // ==========================================
  // EDIT CUSTOMER NOTE
  // ==========================================

  const handleEditNote = (
    note: CustomerNote
  ) => {
    setEditingNote({
      ...note,
    });
  };

  // ==========================================
  // SAVE CUSTOMER NOTE
  // ==========================================

  const handleSaveNote = async () => {
    if (!id || !editingNote) return;

    const updatedText =
      editingNote.note.trim();

    if (!updatedText) {
      alert("Please enter a note.");
      return;
    }

    try {
      setSavingNote(true);

      const response =
        await customerService.updateCustomerNote(
          id,
          editingNote.id,
          updatedText
        );

      const updatedNote =
        response?.data ?? response;

      setCustomer((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          customerNotes:
            prev.customerNotes.map(
              (note) =>
                note.id === editingNote.id
                  ? updatedNote
                  : note
            ),
        };
      });

      setEditingNote(null);
    } catch (error: any) {
      console.error(
        "Update Customer Note Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update customer note"
      );
    } finally {
      setSavingNote(false);
    }
  };

  // ==========================================
  // DELETE CUSTOMER NOTE
  // ==========================================

  const handleDeleteNote = async (
    noteId: string
  ) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    try {
      setDeletingNoteId(noteId);

      await customerService.deleteCustomerNote(
        id,
        noteId
      );

      setCustomer((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          customerNotes:
            prev.customerNotes.filter(
              (note) => note.id !== noteId
            ),
        };
      });
    } catch (error: any) {
      console.error(
        "Delete Customer Note Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete customer note"
      );
    } finally {
      setDeletingNoteId(null);
    }
  };

  // ==========================================
  // EDIT ADDRESS
  // ==========================================

  const handleEditAddress = (
    address: Address
  ) => {
    setEditingAddress({
      ...address,
      province: address.province ?? "",
      postalCode: address.postalCode ?? "",
      country:
        address.country || "Sri Lanka",
    });
  };

  // ==========================================
  // SAVE ADDRESS
  // ==========================================

  const handleSaveAddress = async () => {
    if (!id || !editingAddress) {
      return;
    }

    try {
      setSavingAddress(true);

      const response =
        await customerService.updateAddress(
          id,
          editingAddress.id,
          {
            fullName:
              editingAddress.fullName,
            phone:
              editingAddress.phone,
            street:
              editingAddress.street,
            city:
              editingAddress.city,
            province:
              editingAddress.province ||
              undefined,
            postalCode:
              editingAddress.postalCode ||
              undefined,
            country:
              editingAddress.country,
          }
        );

      const updatedAddress =
        response?.data ?? response;

      setCustomer((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          addresses:
            prev.addresses.map(
              (address) =>
                address.id ===
                editingAddress.id
                  ? updatedAddress
                  : address
            ),
        };
      });

      setEditingAddress(null);
    } catch (error: any) {
      console.error(
        "Update Address Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update address"
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // ==========================================
  // SET DEFAULT ADDRESS
  // ==========================================

  const handleSetDefaultAddress = async (
    addressId: string
  ) => {
    if (!id) return;

    try {
      setAddressActionLoading(addressId);

      await customerService.setDefaultAddress(
        id,
        addressId
      );

      setCustomer((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          addresses:
            prev.addresses.map(
              (address) => ({
                ...address,
                isDefault:
                  address.id === addressId,
              })
            ),
        };
      });
    } catch (error: any) {
      console.error(
        "Set Default Address Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to set default address"
      );
    } finally {
      setAddressActionLoading(null);
    }
  };

  // ==========================================
  // DELETE ADDRESS
  // ==========================================

  const handleDeleteAddress = async (
    addressId: string
  ) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      setAddressActionLoading(addressId);

      await customerService.deleteAddress(
        id,
        addressId
      );

      setCustomer((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          addresses:
            prev.addresses.filter(
              (address) =>
                address.id !== addressId
            ),
        };
      });
    } catch (error: any) {
      console.error(
        "Delete Address Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete address"
      );
    } finally {
      setAddressActionLoading(null);
    }
  };

  // ==========================================
  // FORMATTERS
  // ==========================================

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (
    date?: string | null
  ) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleString("en-GB");
  };

  const formatMoney = (
    amount: number,
    currency: string
  ) => {
    return `${currency} ${Number(
      amount || 0
    ).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const totalPaid =
    customer?.orders?.reduce(
      (sum, order) =>
        sum + Number(order.paidAmount || 0),
      0
    ) ?? 0;

  const totalOutstanding =
    customer?.orders?.reduce(
      (sum, order) =>
        sum + Number(order.balance || 0),
      0
    ) ?? 0;

  const totalSpent =
    customer?.orders?.reduce(
      (sum, order) =>
        sum + Number(order.totalFinal || 0),
      0
    ) ?? 0;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-gray-500">
          Loading customer...
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR / CUSTOMER NOT FOUND
  // ==========================================

  if (!customer) {
    return (
      <div className="space-y-4 p-6">
        <button
          type="button"
          onClick={() =>
            navigate("/admin/customers")
          }
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          ← Back to Customers
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || "Customer not found"}
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-w-0 w-full space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-6">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <button
            type="button"
            onClick={() =>
              navigate("/admin/customers")
            }
            className="mb-3 text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Customers
          </button>

          <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
  {customer.fullName}
</h1>

          <p className="mt-1 text-sm text-gray-500">
            Customer ID: {customer.id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

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
      {/* CUSTOMER INFORMATION + SUMMARY */}
      {/* ===================================== */}

      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">

        {/* CUSTOMER INFORMATION */}

        <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">

          <h2 className="mb-5 text-xl font-semibold text-gray-900">
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
              value={
                customer.email ||
                "Not added"
              }
            />

            <InfoItem
              label="Role"
              value={customer.role}
            />

            <InfoItem
              label="Account Status"
              value={
                customer.isActive
                  ? "Active"
                  : "Inactive"
              }
            />

            <InfoItem
              label="Customer Since"
              value={formatDate(
                customer.createdAt
              )}
            />

          </div>
        </div>

        {/* CUSTOMER SUMMARY */}

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Customer Summary
          </h2>

          <div className="space-y-4">

            <SummaryItem
              label="Total Orders"
              value={
                customer.orders.length
              }
            />

            <SummaryItem
              label="Addresses"
              value={
                customer.addresses.length
              }
            />

            <SummaryMoneyItem
              label="Total Spent"
              value={totalSpent}
              currency={
                customer.orders[0]?.currency ||
                "LKR"
              }
            />

            <SummaryMoneyItem
              label="Total Paid"
              value={totalPaid}
              currency={
                customer.orders[0]?.currency ||
                "LKR"
              }
            />

            <SummaryMoneyItem
              label="Outstanding"
              value={totalOutstanding}
              currency={
                customer.orders[0]?.currency ||
                "LKR"
              }
              danger={totalOutstanding > 0}
            />

          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* ADDRESSES */}
      {/* ===================================== */}

      <section>

        {/* ADDRESS SECTION HEADER */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              📍 Addresses
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {customer.addresses.length}{" "}
              {customer.addresses.length === 1
                ? "address"
                : "addresses"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/customers/${customer.id}/add-address`
              )
            }
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            + Add Address
          </button>

        </div>

        {/* ADDRESS LIST */}

        {customer.addresses.length === 0 ? (

          <div className="rounded-xl border bg-white p-6 text-gray-500 shadow-sm">
            No addresses found.
          </div>

        ) : (

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">

            {customer.addresses.map(
              (address) => {

                const actionLoading =
                  addressActionLoading ===
                  address.id;

                return (
                  <div
                    key={address.id}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                  >

                    {/* ADDRESS HEADER */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-5">

                        <p className="font-semibold text-gray-900">
                          {address.fullName}
                        </p>

                        <p className="mt-2 text-sm text-gray-600">
                          📞 {address.phone}
                        </p>

                      </div>

                      {address.isDefault && (
                        <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          ✓ Default
                        </span>
                      )}

                    </div>

                    {/* ADDRESS DETAILS */}

                    <div className="mt-4 space-y-1 text-sm text-gray-600">

                      <p>
                        {address.street}
                      </p>

                      <p>
                        {address.city}
                        {address.province
                          ? `, ${address.province}`
                          : ""}
                      </p>

                      {address.postalCode && (
                        <p>
                          Postal Code:{" "}
                          {address.postalCode}
                        </p>
                      )}

                      <p>
                        {address.country}
                      </p>

                    

                    {/* ADDRESS ACTIONS */}

                    <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
  <button
    type="button"
    onClick={() => handleEditAddress(address)}
    disabled={actionLoading}
    className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
  >
    ✏️ Edit
  </button>

  {!address.isDefault && (
    <button
      type="button"
      onClick={() => handleSetDefaultAddress(address.id)}
      disabled={actionLoading}
      className="inline-flex items-center justify-center rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
    >
      ⭐ Set Default
    </button>
  )}

  <button
    type="button"
    onClick={() => handleDeleteAddress(address.id)}
    disabled={actionLoading}
    className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
  >
    🗑️ Delete
  </button>
</div>
</div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* ===================================== */}
      {/* EDIT ADDRESS MODAL */}
      {/* ===================================== */}

      {editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-2 sm:p-4">

          <div className="my-auto max-h-[95dvh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:p-6">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Address
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update customer delivery address
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingAddress(null)
                }
                disabled={savingAddress}
                className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* FULL NAME */}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={
                    editingAddress.fullName
                  }
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      fullName:
                        e.target.value,
                    })
                  }
                  disabled={savingAddress}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="text"
                  value={
                    editingAddress.phone
                  }
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      phone:
                        e.target.value,
                    })
                  }
                  disabled={savingAddress}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* STREET */}

              <div className="md:col-span-2">

                <label className="text-sm font-medium text-gray-700">
                  Street Address
                </label>

                <input
                  type="text"
                  value={
                    editingAddress.street
                  }
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      street:
                        e.target.value,
                    })
                  }
                  disabled={savingAddress}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />

              </div>

              {/* CITY */}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  City
                </label>

                <input
                  type="text"
                  value={
                    editingAddress.city
                  }
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      city:
                        e.target.value,
                    })
                  }
                  disabled={savingAddress}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* PROVINCE */}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Province
                </label>

                <input
                  type="text"
                  value={
                    editingAddress.province ??
                    ""
                  }
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      province:
                        e.target.value,
                    })
                  }
                  disabled={savingAddress}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* POSTAL CODE */}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Postal Code
                </label>

                <input
                  type="text"
                  value={
                    editingAddress.postalCode ??
                    ""
                  }
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      postalCode:
                        e.target.value,
                    })
                  }
                  disabled={savingAddress}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* COUNTRY */}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Country
                </label>

                <input
                  type="text"
                  value={
                    editingAddress.country
                  }
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      country:
                        e.target.value,
                    })
                  }
                  disabled={savingAddress}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

            </div>

            {/* MODAL ACTIONS */}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setEditingAddress(null)
                }
                disabled={savingAddress}
                className="w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 sm:w-auto"
              >
                {savingAddress
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* ORDER HISTORY */}
      {/* ===================================== */}

      <section>

        {/* ORDER HEADER */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              🛒 Order History
            </h2>

            <span className="text-sm text-gray-500">
              {customer.orders.length}{" "}
              {customer.orders.length === 1
                ? "Order"
                : "Orders"}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/customers/${customer.id}/draft-order`
              )
            }
            className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6"
          >
            + Draft Order
          </button>

        </div>

        {/* ORDER LIST */}

        {customer.orders.length === 0 ? (

          <div className="rounded-xl border bg-white p-6 text-gray-500 shadow-sm">
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
                      <h3 className="font-semibold text-gray-900">
                        Order #
                        {order.id.slice(
                          0,
                          8
                        )}
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
                        status={
                          order.paymentStatus
                        }
                      />

                      <StatusBadge
                        label={
                          order.shippingStatus
                        }
                      />

                    </div>

                  </div>

                  {/* ORDER SUMMARY */}

                  <div className="mt-5 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 lg:grid-cols-4">

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
                          status={
                            order.paymentStatus
                          }
                        />
                      </div>
                    </div>

                  </div>

                  {/* ORDER ITEMS */}

                  <div className="mt-6">

                    <h4 className="mb-3 font-medium text-gray-900">
                      Order Items
                    </h4>

                    {order.items.length ===
                    0 ? (

                      <p className="text-sm text-gray-500">
                        No items found.
                      </p>

                    ) : (

                      <div className="overflow-x-auto">

                        <table className="w-full min-w-[560px] text-sm">

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
                                        {
                                          item
                                            .productVariant
                                            .product
                                            .name
                                        }
                                      </p>

                                      <p className="text-xs text-gray-500">
                                        SKU:{" "}
                                        {
                                          item
                                            .productVariant
                                            .sku
                                        }
                                      </p>

                                      <p className="text-xs text-gray-500">
                                        Variant:{" "}
                                        {
                                          item
                                            .productVariant
                                            .weight
                                        }
                                      </p>

                                    </div>

                                  </td>

                                  <td className="py-3">
                                    {
                                      item.quantity
                                    }
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

                    <h4 className="mb-3 font-medium text-gray-900">
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
                                <p className="mt-3 break-all text-xs text-gray-500">
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

                  {/* DELIVERY ADDRESS */}

                  {order.address && (
                    <div className="mt-6 rounded-lg bg-gray-50 p-4">

                      <h4 className="mb-2 font-medium text-gray-900">
                        📍 Delivery Address
                      </h4>

                      <p className="text-sm">
                        {
                          order.address
                            .fullName
                        }
                      </p>

                      <p className="text-sm text-gray-600">
                        {
                          order.address
                            .street
                        }
                        ,{" "}
                        {
                          order.address
                            .city
                        }
                      </p>

                      {order.address.province && (
                        <p className="text-sm text-gray-600">
                          {
                            order.address
                              .province
                          }
                        </p>
                      )}

                      {order.address.postalCode && (
                        <p className="text-sm text-gray-600">
                          Postal Code:{" "}
                          {
                            order.address
                              .postalCode
                          }
                        </p>
                      )}

                      <p className="text-sm text-gray-600">
                        {
                          order.address
                            .country
                        }
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

        {/* NOTES HEADER */}

        <div className="mb-4">

          <h2 className="text-xl font-semibold text-gray-900">
            📝 Customer Notes
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Internal notes about this customer
          </p>

        </div>

        {/* ADD NOTE */}

        <div className="mb-5 rounded-xl border bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-3 md:flex-row">

            <textarea
              value={noteText}
              onChange={(e) =>
                setNoteText(
                  e.target.value
                )
              }
              placeholder="Enter customer note..."
              rows={3}
              disabled={addingNote}
              className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-5"
            />

            <button
              type="button"
              onClick={handleAddNote}
              disabled={
                addingNote ||
                !noteText.trim()
              }
              className="self-end rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:self-center"
            >
              {addingNote
                ? "Adding..."
                : "Add Note"}
            </button>

          </div>

        </div>

        {/* NOTES LIST */}

        {!customer.customerNotes ||
        customer.customerNotes.length ===
          0 ? (

          <div className="rounded-xl border bg-white p-6 text-gray-500 shadow-sm">
            No notes found.
          </div>

        ) : (

          <div className="space-y-3">

            {customer.customerNotes.map(
              (note) => (

                <div
                  key={note.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >

                  {/* NOTE CONTENT */}

                  <div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                      {note.note}
                    </p>

                    <p className="mt-3 text-xs text-gray-400">
                      Added:{" "}
                      {formatDateTime(
                        note.createdAt
                      )}

                      {note.updatedAt &&
                        note.updatedAt !==
                          note.createdAt && (
                          <>
                            {" "}
                            · Updated:{" "}
                            {formatDateTime(
                              note.updatedAt
                            )}
                          </>
                        )}
                    </p>

                  </div>

                  {/* NOTE ACTIONS */}
<div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">
  <button
    type="button"
    onClick={() => {
      console.log("Edit note clicked:", note.id);
      handleEditNote(note);
    }}
    className="!visible !inline-flex items-center justify-center rounded-lg border border-blue-500 bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800"
  >
    ✏️ Edit
  </button>

  <button
  type="button"
  onClick={() => handleDeleteNote(note.id)}
  disabled={deletingNoteId === note.id}
  className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
>
  {deletingNoteId === note.id
    ? "Deleting..."
    : "🗑️ Delete"}
</button>
</div>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* ===================================== */}
      {/* EDIT CUSTOMER NOTE MODAL */}
      {/* ===================================== */}

      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-2 sm:p-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Customer Note
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update the internal customer note
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingNote(null)
                }
                disabled={savingNote}
                className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              >
                ✕
              </button>

            </div>

            {/* NOTE INPUT */}

            <textarea
              value={editingNote.note}
              onChange={(e) =>
                setEditingNote({
                  ...editingNote,
                  note: e.target.value,
                })
              }
              rows={6}
              disabled={savingNote}
              autoFocus
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />

            {/* MODAL ACTIONS */}

            <div className="mt-5 flex justify-end gap-3 border-t pt-5">

              <button
                type="button"
                onClick={() =>
                  setEditingNote(null)
                }
                disabled={savingNote}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveNote}
                disabled={
                  savingNote ||
                  !editingNote.note.trim()
                }
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingNote
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// INFO ITEM
// ==========================================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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

// ==========================================
// SUMMARY ITEM
// ==========================================

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="font-semibold text-gray-900">
        {value.toLocaleString()}
      </span>

    </div>
  );
}

// ==========================================
// SUMMARY MONEY ITEM
// ==========================================

function SummaryMoneyItem({
  label,
  value,
  currency,
  danger = false,
}: {
  label: string;
  value: number;
  currency: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span
        className={`font-semibold ${
          danger
            ? "text-red-600"
            : "text-green-600"
        }`}
      >
        {currency}{" "}
        {Number(value || 0).toLocaleString(
          "en-LK",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}
      </span>

    </div>
  );
}

// ==========================================
// PAYMENT STATUS BADGE
// ==========================================

function PaymentStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    String(status || "").toUpperCase();

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
      : normalized === "PENDING" ||
        normalized === "UNPAID"
      ? {
          label:
            normalized === "UNPAID"
              ? "Unpaid"
              : "Pending",
          className:
            "bg-orange-100 text-orange-700",
        }
      : normalized === "FAILED"
      ? {
          label: "Failed",
          className:
            "bg-red-100 text-red-700",
        }
      : normalized === "REFUNDED"
      ? {
          label: "Refunded",
          className:
            "bg-purple-100 text-purple-700",
        }
      : {
          label: status || "Unknown",
          className:
            "bg-gray-100 text-gray-700",
        };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ==========================================
// GENERIC STATUS BADGE
// ==========================================

function StatusBadge({
  label,
}: {
  label: string;
}) {
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
      {label || "Unknown"}
    </span>
  );
}