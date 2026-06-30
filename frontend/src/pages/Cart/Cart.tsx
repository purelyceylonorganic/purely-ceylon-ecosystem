import { useEffect, useState } from "react";
import { cartService } from "../../services/cart.service";
import { useNavigate } from "react-router-dom";

type CartItem = {
  id: string;
  variantId: string;
  productName: string;
  image: string | null;
  sku: string;
  weight: string;
  priceUSD: number;
  quantity: number;
  itemTotalUSD: number;
};

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);

      const response = await cartService.getCart();

      console.log("Cart Response:", response);

      setItems(response.items ?? []);
      setTotal(response.totalConverted ?? 0);
      setCurrency(response.currency ?? "USD");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function increase(item: CartItem) {
    await cartService.updateQuantity(item.id, item.quantity + 1);
    loadCart();
  }

  async function decrease(item: CartItem) {
    if (item.quantity <= 1) return;

    await cartService.updateQuantity(item.id, item.quantity - 1);
    loadCart();
  }

  async function remove(itemId: string) {
    if (!confirm("Remove this item?")) return;

    await cartService.removeItem(itemId);
    loadCart();
  }

  if (loading) {
    return <h2 style={{ padding: 40 }}>Loading Cart...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1>🛒 Shopping Cart</h1>

      {items.length === 0 ? (
        <h2>Your Cart is Empty</h2>
      ) : (
        <>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "20px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                marginBottom: "20px",
                alignItems: "center",
              }}
            >
              <img
                src={item.image ?? "/no-image.png"}
                alt={item.productName}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />

              <div style={{ flex: 1 }}>
                <h2>{item.productName}</h2>

                <p>SKU : {item.sku}</p>

                <p>Weight : {item.weight}</p>

                <p>
                  Price : {currency} {item.priceUSD}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <button onClick={() => decrease(item)}>
                    -
                  </button>

                  <strong>{item.quantity}</strong>

                  <button onClick={() => increase(item)}>
                    +
                  </button>
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                <h3>
                  {currency} {item.itemTotalUSD}
                </h3>

                <button
                  onClick={() => remove(item.id)}
                  style={{
                    marginTop: "10px",
                    background: "red",
                    color: "#fff",
                    border: "none",
                    padding: "10px",
                    cursor: "pointer",
                    borderRadius: "5px",
                  }}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: "30px",
              textAlign: "right",
              borderTop: "2px solid #ddd",
              paddingTop: "20px",
            }}
          >
            <h2>
              Grand Total : {currency} {total}
            </h2>

            <button
              style={{
                padding: "15px 40px",
                background: "#0E4B32",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >

              <button
  onClick={() => navigate("/checkout")}
  style={{
    padding: "15px 40px",
    background: "#0E4B32",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
  }}
>
  Proceed To Checkout
</button>
</button>
              
          </div>
        </>
      )}
    </div>
  );
}