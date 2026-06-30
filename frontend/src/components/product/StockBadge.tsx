interface Props {
  stock: number;
}

export default function StockBadge({ stock }: Props) {
  return (
    <div
      style={{
        marginTop: 20,
      }}
    >
      {stock > 10 ? (
        <span
          style={{
            color: "green",
            fontWeight: "bold",
          }}
        >
          ✅ In Stock
        </span>
      ) : stock > 0 ? (
        <span
          style={{
            color: "orange",
            fontWeight: "bold",
          }}
        >
          ⚠ Only {stock} Left
        </span>
      ) : (
        <span
          style={{
            color: "red",
            fontWeight: "bold",
          }}
        >
          ❌ Out of Stock
        </span>
      )}
    </div>
  );
}