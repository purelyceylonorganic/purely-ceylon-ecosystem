import { useCurrency } from "../context/CurrencyContext";
import { CURRENCIES } from "../lib/money";

export default function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      role="group"
      aria-label="Currency"
      className="flex h-10 items-center rounded-full border border-gray-200 bg-white p-1 text-xs font-bold"
    >
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={`h-full rounded-full px-2.5 transition ${
            currency === c
              ? "bg-[#0E4B32] text-white"
              : "text-gray-600 hover:text-[#0E4B32]"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}