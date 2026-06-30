import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cartService } from "../../services/cart.service";

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // Load Cart
  // ===============================
  async function loadCart() {
    try {
      setLoading(true);

      const response = await cartService.getCart();

      setCart(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  // ===============================
  // Increase Quantity
  // ===============================
  async function increase(item: any) {
    try {
      await cartService.updateQuantity(
        item.id,
        item.quantity + 1
      );

      loadCart();
    } catch (err) {
      console.error(err);
    }
  }

  // ===============================
  // Decrease Quantity
  // ===============================
  async function decrease(item: any) {
    if (item.quantity <= 1) return;

    try {
      await cartService.updateQuantity(
        item.id,
        item.quantity - 1
      );

      loadCart();
    } catch (err) {
      console.error(err);
    }
  }

  // ===============================
  // Remove Item
  // ===============================
  async function remove(itemId: string) {
    const ok = window.confirm(
      "Remove this product?"
    );

    if (!ok) return;

    try {
      await cartService.removeItem(itemId);

      loadCart();
    } catch (err) {
      console.error(err);
    }
  }

  // ===============================
  // Loading
  // ===============================
  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Loading Cart...</h2>
      </div>
    );
  }

  // ===============================
  // Empty Cart
  // ===============================
  if (!cart || cart.items.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
        }}
      >
        <h1>🛒 Shopping Cart</h1>

        <h2>Your Cart is Empty</h2>

        <Link to="/products">
          <button
            style={{
              marginTop: 20,
              padding: "14px 30px",
              background: "#0E4B32",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: 20,
      }}
    >
      <h1>🛒 Shopping Cart</h1>

      {cart.items.map((item: any) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: 20,
            border: "1px solid #ddd",
            padding: 20,
            marginBottom: 20,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          {/* Image */}
          <img
            src={
              item.image ??
              "https://placehold.co/120x120?text=No+Image"
            }
            alt={item.productName}
            style={{
              width: 120,
              height: 120,
              objectFit: "cover",
              borderRadius: 10,
            }}
          />

          {/* Details */}
          <div style={{ flex: 1 }}>
            <h2>{item.productName}</h2>

            <p>
              <strong>SKU :</strong> {item.sku}
            </p>

            <p>
              <strong>Weight :</strong>{" "}
              {item.weight}
            </p>

            <p>
              <strong>Price :</strong>{" "}
              {cart.currency} {item.priceUSD}
            </p>

            {/* Quantity */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 15,
              }}
            >
              <button
                onClick={() => decrease(item)}
                style={{
                  width: 35,
                  height: 35,
                  cursor: "pointer",
                }}
              >
                -
              </button>

              <strong>{item.quantity}</strong>

              <button
                onClick={() => increase(item)}
                style={{
                  width: 35,
                  height: 35,
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>

            <p
              style={{
                marginTop: 15,
                fontWeight: "bold",
              }}
            >
              Total : {cart.currency}{" "}
              {item.itemTotalUSD}
            </p>

            <button
              onClick={() => remove(item.id)}
              style={{
                marginTop: 10,
                padding: "10px 20px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              🗑 Remove
            </button>
          </div>
        </div>
      ))}

      <hr />

      <div
        style={{
          textAlign: "right",
          marginTop: 25,
        }}
      >
        <h2>
          Grand Total : {cart.currency}{" "}
          {cart.totalConverted}
        </h2>

        <Link to="/checkout">
          <button
            style={{
              marginTop: 20,
              padding: "15px 35px",
              background: "#0E4B32",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 17,
              fontWeight: "bold",
            }}
          >
            Proceed To Checkout →
          </button>
        </Link>
      </div>
    </div>
  );
}