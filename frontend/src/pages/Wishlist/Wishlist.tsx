import { useEffect, useState } from "react";

import { wishlistService } from "../../services/wishlist.service";
import { cartService } from "../../services/cart.service";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      setLoading(true);

      const response = await wishlistService.getWishlist();

      console.log("Wishlist Response:", response);

      setWishlist(
        Array.isArray(response.wishlist?.items)
          ? response.wishlist.items
          : []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await wishlistService.removeWishlist(id);

      alert("❤️ Removed Successfully");

      loadWishlist();
    } catch (error) {
      console.error(error);

      alert("Remove failed.");
    }
  }

  async function handleMoveToCart(item: any) {
    try {
      await cartService.addToCart(
        item.productVariant.id,
        1
      );

      await wishlistService.removeWishlist(item.id);

      alert("🛒 Moved To Cart Successfully");

      loadWishlist();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Move to cart failed."
      );
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h1>❤️ My Wishlist</h1>

        <h3>Loading...</h3>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div style={{ padding: 40 }}>
        <h1>❤️ My Wishlist</h1>

        <h3>Your Wishlist is Empty</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1
        style={{
          marginBottom: "30px",
        }}
      >
        ❤️ My Wishlist
      </h1>

      {wishlist.map((item: any) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            background: "#fff",
          }}
        >
          {/* Product Image */}

          <img
            src={
              item.productVariant?.product?.images?.[0]?.url ??
              "/no-image.png"
            }
            alt={
              item.productVariant?.product?.name
            }
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />

          {/* Product Details */}

          <div style={{ flex: 1 }}>
            <h2>
              {item.productVariant?.product?.name}
            </h2>

            <p>
              <strong>SKU :</strong>{" "}
              {item.productVariant?.sku}
            </p>

            <p>
              <strong>Weight :</strong>{" "}
              {item.productVariant?.weight}
            </p>

            <p>
              <strong>Price :</strong>{" "}
              USD {item.productVariant?.price}
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() =>
                  handleMoveToCart(item)
                }
                style={{
                  padding: "12px 20px",
                  background: "#0E4B32",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                🛒 Move To Cart
              </button>

              <button
                onClick={() =>
                  handleRemove(item.id)
                }
                style={{
                  padding: "12px 20px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ❤️ Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}