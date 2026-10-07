import { useEffect, useState } from "react";
import {
  addressService,
  type Address,
} from "../../services/address.service";
import AddAddressModal from "./AddAddressModal";

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setLoading(true);
      const response = await addressService.getMyAddresses();
      setAddresses(response.data ?? response ?? []);
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (address: Address) => {
    setCurrentAddress(address);
    setOpenModal(true);
  };

  const handleDelete = async (address: Address) => {
    const id = address.id;
    if (!id) return;

    if (
      !window.confirm(
        "இந்த முகவரியை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?"
      )
    ) {
      return;
    }

    try {
      await addressService.deleteAddress(id as string);
      await loadAddresses();
    } catch (error) {
      console.error("Failed to delete address:", error);
      alert("முகவரியை நீக்க முடியவில்லை!");
    }
  };

  const handleMakeDefault = async (address: Address) => {
    const id = address.id;
    if (!id) return;

    try {
      await addressService.setDefaultAddress(id as string);
      await loadAddresses();
    } catch (error) {
      console.error("Failed to set default address:", error);
      alert("முதன்மை முகவரியாக மாற்ற முடியவில்லை!");
    }
  };

  const handleAddAddress = () => {
    setCurrentAddress(null);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setCurrentAddress(null);
    loadAddresses();
  };

  if (loading) {
    return (
      <div className="flex min-h-[180px] w-full items-center justify-center px-4 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0E4B32]/20 border-t-[#0E4B32]" />
          <p className="text-sm font-semibold text-gray-500">
            Loading addresses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl overflow-x-hidden px-1 py-2 sm:px-2 sm:py-4">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center rounded-full bg-[#0E4B32]/10 px-3 py-1 text-xs font-bold text-[#0E4B32]">
            📍 Address Book
          </div>

          <h1 className="text-2xl font-extrabold leading-tight text-[#111111] sm:text-3xl">
            My Delivery Addresses
          </h1>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            Manage your saved delivery addresses.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddAddress}
          className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#111111] active:scale-[0.98] sm:w-auto"
        >
          <span className="mr-2 text-lg">+</span>
          Add Address
        </button>
      </div>

      {/* Empty State */}
      {addresses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white px-5 py-10 text-center shadow-sm sm:rounded-3xl sm:px-8 sm:py-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0E4B32]/10 text-3xl">
            📍
          </div>

          <h2 className="mt-4 text-lg font-extrabold text-gray-900 sm:text-xl">
            No Saved Addresses
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            Add your delivery address so you can complete your checkout
            faster.
          </p>

          <button
            type="button"
            onClick={handleAddAddress}
            className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#111111] sm:w-auto"
          >
            + Add Your First Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md sm:rounded-3xl ${
                address.isDefault
                  ? "border-[#0E4B32]/40 ring-1 ring-[#0E4B32]/10"
                  : "border-gray-200"
              }`}
            >
              {/* Address top */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg">🏠</span>

                      <h3 className="break-words text-base font-extrabold text-gray-900 sm:text-lg">
                        {address.street}
                      </h3>

                      {address.isDefault && (
                        <span className="inline-flex items-center rounded-full bg-[#0E4B32] px-2.5 py-1 text-[11px] font-bold text-white">
                          ✓ Default
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                      <p className="break-words">
                        📍 {address.city}
                      </p>

                      <p className="break-words">
                        🌍 {address.country}
                      </p>
                    </div>
                  </div>

                  {/* Default action */}
                  <div className="shrink-0">
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleMakeDefault(address)}
                        className="min-h-[42px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:border-[#0E4B32] hover:bg-[#0E4B32]/5 hover:text-[#0E4B32] sm:w-auto"
                      >
                        ⭐ Set Default
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 border-t border-gray-100 bg-gray-50/70 p-3 sm:flex sm:justify-end sm:px-5 sm:py-3">
                <button
                  type="button"
                  onClick={() => handleEdit(address)}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  ✏️ Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(address)}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-[0.98]"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <AddAddressModal
        open={openModal}
        address={currentAddress ?? undefined}
        onClose={handleModalClose}
      />
    </div>
  );
}