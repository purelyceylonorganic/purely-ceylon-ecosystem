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
    <div style={{ marginTop: 20 }}>
      <h3>Select Variant</h3>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onSelect(variant)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              cursor: "pointer",
              border:
                selected?.id === variant.id
                  ? "2px solid green"
                  : "1px solid #ccc",
              background:
                selected?.id === variant.id
                  ? "#0E4B32"
                  : "#fff",
              color:
                selected?.id === variant.id
                  ? "#fff"
                  : "#000",
            }}
          >
            {variant.sku}
          </button>
        ))}
      </div>
    </div>
  );
}