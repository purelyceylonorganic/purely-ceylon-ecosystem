import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, MapPin, Save } from "lucide-react";

type Props = {
  onSubmit: (data: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }) => void;
  initialData?: any;
};

export default function AddressForm({ onSubmit, initialData }: Props) {
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [street, setStreet] = useState(initialData?.street || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [province, setProvince] = useState(initialData?.province || "");
  const [postalCode, setPostalCode] = useState(
    initialData?.postalCode || ""
  );
  const [country, setCountry] = useState(
    initialData?.country || "Sri Lanka"
  );
  const [isDefault, setIsDefault] = useState(
    initialData?.isDefault || false
  );

  useEffect(() => {
    if (!initialData) {
      setFullName("");
      setPhone("");
      setStreet("");
      setCity("");
      setProvince("");
      setPostalCode("");
      setCountry("Sri Lanka");
      setIsDefault(false);
      return;
    }

    setFullName(initialData.fullName || "");
    setPhone(initialData.phone || "");
    setStreet(initialData.street || "");
    setCity(initialData.city || "");
    setProvince(initialData.province || "");
    setPostalCode(initialData.postalCode || "");
    setCountry(initialData.country || "Sri Lanka");
    setIsDefault(initialData.isDefault || false);
  }, [initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full Name Required");
      return;
    }

    if (!phone.trim()) {
      toast.error("Phone Number Required");
      return;
    }

    const phoneClean = phone.replace(/\s+/g, "");

    if (!/^\+?\d{7,15}$/.test(phoneClean)) {
      toast.error("Enter a valid Phone Number");
      return;
    }

    if (!street.trim()) {
      toast.error("Street Address Required");
      return;
    }

    if (!city.trim()) {
      toast.error("City Name Required");
      return;
    }

    if (!province.trim()) {
      toast.error("Province/State Required");
      return;
    }

    if (!postalCode.trim()) {
      toast.error("Postal Code Required");
      return;
    }

    if (!country.trim()) {
      toast.error("Country Name Required");
      return;
    }

    onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      isDefault,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-5"
    >
      {/* Form Header */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#0E4B32]/10 bg-[#FFF8EE] p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32]">
          <MapPin size={20} />
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-[#111111]">
            Delivery Information
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
            Enter the address where you want your order delivered.
          </p>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label
          htmlFor="address-full-name"
          className="mb-1.5 block text-sm font-bold text-gray-700"
        >
          Full Name <span className="text-red-500">*</span>
        </label>

        <input
          id="address-full-name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          className={inputClass}
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="address-phone"
          className="mb-1.5 block text-sm font-bold text-gray-700"
        >
          Phone Number <span className="text-red-500">*</span>
        </label>

        <div className="flex w-full gap-2">
          <select
            aria-label="Country code"
            defaultValue="+94"
            onChange={(e) => {
              const code = e.target.value;

              const numberWithoutCode = phone
                .replace(/^\+\d+\s*/, "")
                .trim();

              setPhone(
                numberWithoutCode
                  ? `${code} ${numberWithoutCode}`
                  : `${code} `
              );
            }}
            className="min-h-[50px] w-[100px] shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-2 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 sm:w-[115px]"
          >
            <option value="+94">🇱🇰 +94</option>
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
          </select>

          <input
            id="address-phone"
            type="tel"
            inputMode="tel"
            placeholder="771234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className={`${inputClass} min-w-0 flex-1`}
          />
        </div>
      </div>

      {/* Street */}
      <div>
        <label
          htmlFor="address-street"
          className="mb-1.5 block text-sm font-bold text-gray-700"
        >
          Street Address <span className="text-red-500">*</span>
        </label>

        <input
          id="address-street"
          type="text"
          placeholder="No. 12, Main Street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          autoComplete="street-address"
          className={inputClass}
        />
      </div>

      {/* City + Province */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="address-city"
            className="mb-1.5 block text-sm font-bold text-gray-700"
          >
            City <span className="text-red-500">*</span>
          </label>

          <input
            id="address-city"
            type="text"
            placeholder="Colombo"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="address-province"
            className="mb-1.5 block text-sm font-bold text-gray-700"
          >
            Province / State <span className="text-red-500">*</span>
          </label>

          <input
            id="address-province"
            type="text"
            placeholder="Western"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            autoComplete="address-level1"
            className={inputClass}
          />
        </div>
      </div>

      {/* Postal + Country */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="address-postal"
            className="mb-1.5 block text-sm font-bold text-gray-700"
          >
            Postal Code <span className="text-red-500">*</span>
          </label>

          <input
            id="address-postal"
            type="text"
            inputMode="numeric"
            placeholder="00100"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            autoComplete="postal-code"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="address-country"
            className="mb-1.5 block text-sm font-bold text-gray-700"
          >
            Country <span className="text-red-500">*</span>
          </label>

          <input
            id="address-country"
            type="text"
            placeholder="Sri Lanka"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            autoComplete="country-name"
            className={inputClass}
          />
        </div>
      </div>

      {/* Default Address */}
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-[#0E4B32]/30 hover:bg-[#0E4B32]/5">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
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

      {/* Submit */}
      <button
        type="submit"
        className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#111111] active:scale-[0.98] sm:min-h-[50px]"
      >
        {initialData ? (
          <>
            <Check size={18} />
            Update Address
          </>
        ) : (
          <>
            <Save size={18} />
            Save Address
          </>
        )}
      </button>
    </form>
  );
}

const inputClass =
  "min-h-[50px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10";