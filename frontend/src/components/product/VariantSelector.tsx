interface Variant {
  id: string;
  sku: string;
  stock: number;
  price: number;
}

interface Props {
  variants: Variant[];
  selected: Variant | null;
  onSelect: (variant: Variant) => void;
}

export default function VariantSelector({
  variants,
  selected,
  onSelect,
}: Props) {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 w-full">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
        Select Variant
      </h3>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {variants.map((variant) => {
          const isSelected = selected?.id === variant.id;

          return (
            <button
              type="button"
              key={variant.id}
              onClick={() => onSelect(variant)}
              className={`min-h-[52px] w-full rounded-xl border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-[#0E4B32] bg-[#0E4B32] text-white shadow-md"
                  : "border-gray-200 bg-white text-gray-800 hover:border-[#0E4B32] hover:bg-[#0E4B32]/5"
              }`}
            >
              <span className="block text-sm font-bold">
                {variant.sku}
              </span>

              <span
                className={`mt-1 block text-xs ${
                  isSelected
                    ? "text-white/80"
                    : "text-gray-500"
                }`}
              >
                LKR{" "}
                {Number(variant.price).toLocaleString(
                  "en-LK",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}{" "}
                •{" "}
                {variant.stock > 0
                  ? `${variant.stock} available`
                  : "Out of stock"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}