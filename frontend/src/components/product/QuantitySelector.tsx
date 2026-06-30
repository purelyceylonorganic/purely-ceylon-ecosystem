interface Props {
  quantity: number;
  setQuantity: (value: number) => void;
}

export default function QuantitySelector({
  quantity,
  setQuantity,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginTop: 20,
      }}
    >
      <button
        onClick={() =>
          quantity > 1 && setQuantity(quantity - 1)
        }
      >
        -
      </button>

      <h3>{quantity}</h3>

      <button
        onClick={() => setQuantity(quantity + 1)}
      >
        +
      </button>
    </div>
  );
}