import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, MapPin, Check, Loader2 } from "lucide-react";
import { addressService, type Address } from "../../services/address.service";

type FormFields = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

type Props = {
  open: boolean;
  onClose: () => void;
  address?: Address | null;
};

export default function AddAddressModal({
  open,
  onClose,
  address,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormFields>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Sri Lanka",
    isDefault: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Sri Lanka",
      isDefault: false,
    });

    setErrors({});
  };

  useEffect(() => {
    if (!open) return;

    if (address) {
      setFormData({
        fullName: address.fullName || "",
        phone: address.phone || "",
        street: address.street || "",
        city: address.city || "",
        province: address.province || "",
        postalCode: address.postalCode || "",
        country: address.country || "Sri Lanka",
        isDefault: address.isDefault || false,
      });
    } else {
      resetForm();
    }
  }, [address, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const requiredFields: (keyof FormFields)[] = [
      "fullName",
      "phone",
      "street",
      "city",
      "province",
      "postalCode",
      "country",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field];

      if (typeof value === "string" && !value.trim()) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const updateField = (
    field: keyof FormFields,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      if (address?.id) {
        await addressService.updateAddress(address.id, formData);
        toast.success("✅ Address updated successfully!");
      } else {
        await addressService.addAddress(formData);
        toast.success("✅ Address saved successfully!");
      }

      onClose();
    } catch (error: any) {
      console.error("Error saving address:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to save address."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const fields = [
    { label: "Full Name", key: "fullName", type: "text" },
    { label: "Phone Number", key: "phone", type: "tel" },
    { label: "Street Address", key: "street", type: "text" },
    { label: "City", key: "city", type: "text" },
    { label: "Province / State", key: "province", type: "text" },
    { label: "Postal / ZIP Code", key: "postalCode", type: "text" },
    { label: "Country", key: "country", type: "text" },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
    >
      <div className="relative flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">

        {/* Header */}
        <div className="shrink-0 border-b border-gray-100 bg-[#FFF8EE] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32]">
                <MapPin size={22} />
              </div>

              <div className="min-w-0">
                <h2
                  id="address-modal-title"
                  className="text-lg font-extrabold leading-tight text-[#111111] sm:text-xl"
                >
                  {address
                    ? "Edit Delivery Address"
                    : "Add Delivery Address"}
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                  Enter your delivery details carefully.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close address form"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={21} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {fields.map((field) => {
              const error =
                errors[field.key as keyof FormFields];

              return (
                <div
                  key={field.key}
                  className={
                    field.key === "street" ||
                    field.key === "country"
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <label
                    htmlFor={`address-${field.key}`}
                    className="mb-1.5 block text-sm font-bold text-gray-700"
                  >
                    {field.label}
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id={`address-${field.key}`}
                    type={field.type}
                    value={
                      formData[
                        field.key as keyof FormFields
                      ] as string
                    }
                    onChange={(e) =>
                      updateField(
                        field.key as keyof FormFields,
                        e.target.value
                      )
                    }
                    disabled={loading}
                    autoComplete={
                      field.key === "fullName"
                        ? "name"
                        : field.key === "phone"
                        ? "tel"
                        : field.key === "street"
                        ? "street-address"
                        : field.key === "city"
                        ? "address-level2"
                        : field.key === "province"
                        ? "address-level1"
                        : field.key === "postalCode"
                        ? "postal-code"
                        : "country-name"
                    }
                    className={`min-h-[48px] w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${
                      error
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10"
                    } disabled:cursor-not-allowed disabled:bg-gray-100`}
                  />

                  {error && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Default Address */}
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-[#0E4B32]/30 hover:bg-[#0E4B32]/5">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) =>
                updateField("isDefault", e.target.checked)
              }
              disabled={loading}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#0E4B32]"
            />

            <span className="min-w-0">
              <span className="block text-sm font-bold text-gray-800">
                Set as default delivery address
              </span>

              <span className="mt-1 block text-xs leading-5 text-gray-500">
                Use this address automatically during checkout.
              </span>
            </span>
          </label>

          {/* Buttons */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-[48px] w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#111111] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} />
                  {address
                    ? "Update Address"
                    : "Save Address"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}