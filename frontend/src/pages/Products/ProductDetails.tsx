import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { productService } from "../../services/product.service";
import { cartService } from "../../services/cart.service";

import type { Product } from "../../types/product.types";

import ProductGallery from "../../components/product/ProductGallery";
import QuantitySelector from "../../components/product/QuantitySelector";
import StockBadge from "../../components/product/StockBadge";
import VariantSelector from "../../components/product/VariantSelector";
import { wishlistService } from "../../services/wishlist.service";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  async function loadProduct(productId: string) {
  try {
    setLoading(true);

    const response = await productService.getProductById(productId);

    // 👇 இதை சேர்க்கவும்
    console.log("Product API Response:");
    console.log(response.data);

    setProduct(response.data);

    // ✅ Default Variant
    if (response.data.variants?.length > 0) {
      setSelectedVariant(response.data.variants[0]);
    }
  } catch (err) {
    console.error(err);
    setError("Product load செய்ய முடியவில்லை.");
  } finally {
    setLoading(false);
  }
}

  // ==========================
  // ADD TO CART
  // ==========================
  async function handleAddToCart() {
  if (!selectedVariant) {
    alert("Please select a variant.");
    return;
  }

  console.log("Selected Variant:", selectedVariant);
  console.log("Quantity:", quantity);

  try {
    const response = await cartService.addToCart(
      selectedVariant.id,
      quantity
    );

    console.log("Cart Response:", response);

    alert(response.message);

  } catch (error: any) {
    console.log(error.response?.data);

    alert(
      error?.response?.data?.message ||
      "Add to cart failed."
    );
  }
}

  async function handleWishlist() {
  if (!selectedVariant) {
    alert("Please select a variant");
    return;
  }

  try {
    setAddingWishlist(true);

    const response = await wishlistService.addToWishlist(
      selectedVariant.id
    );

    alert(response.message);

  } catch (err: any) {
    console.error(err);

    alert(
      err?.response?.data?.message ??
      "Failed to add wishlist"
    );
  } finally {
    setAddingWishlist(false);
  }
}
  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading Product...</h2>;
  }

  if (error) {
    return (
      <h2
        style={{
          textAlign: "center",
          color: "red",
        }}
      >
        {error}
      </h2>
    );
  }

  if (!product) {
    return (
      <h2 style={{ textAlign: "center" }}>
        Product கிடைக்கவில்லை.
      </h2>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1300px",
        margin: "40px auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "50px",
        padding: "20px",
        alignItems: "start",
      }}
    >
      {/* LEFT */}
      <ProductGallery images={product.images} />

      {/* RIGHT */}
      <div>
        <span
          style={{
            color: "#0E4B32",
            fontWeight: "bold",
            fontSize: "22px",
          }}
        >
          🌿 Organic Product
        </span>

        <h1
          style={{
            marginTop: "10px",
            fontSize: "38px",
          }}
        >
          {product.name}
        </h1>

        <p
          style={{
            color: "#666",
            lineHeight: 1.8,
            marginTop: "20px",
          }}
        >
          {product.description}
        </p>

        {/* Variant Selector */}
        <VariantSelector
          variants={product.variants ?? []}
          selected={selectedVariant}
          onSelect={setSelectedVariant}
        />

        <hr style={{ margin: "20px 0" }} />

        <h2
          style={{
            color: "#b12704",
            fontSize: "34px",
          }}
        >
          LKR {(selectedVariant?.price ?? product?.basePrice ?? 0).toFixed(2)}
        </h2>

        <div style={{ marginTop: "15px" }}>
          <p>
            <strong>Category :</strong>{" "}
            {product.category?.name ?? "N/A"}
          </p>

          <p>
            <strong>Weight :</strong>{" "}
            {selectedVariant?.weight ??
              product.weight ??
              "N/A"}{" "}
            g
          </p>

          <p>
            <strong>SKU :</strong>{" "}
            {selectedVariant?.sku ?? product.sku}
          </p>
        </div>

        <StockBadge
          stock={selectedVariant?.stock ?? product.stock}
        />

        <QuantitySelector
          quantity={quantity}
          setQuantity={setQuantity}
        />

        <button
    onClick={handleWishlist}
    disabled={addingWishlist}
    style={{
      width: "100%",
      padding: "14px",
      background: "#dc2626", // சிவப்பு நிறம்
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    }}
  >
    {addingWishlist ? "Adding to Wishlist..." : "❤️ Add To Wishlist"}
  </button>

  {/* 2. ADD TO CART BUTTON (இரண்டாவது பட்டன்) */}
  <button
    onClick={handleAddToCart}
    style={{
      width: "100%",
      padding: "15px",
      background: "#0E4B32", // உங்கள் பிராண்ட் பச்சை நிறம்
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
    }}
  >
    🛒 Add {quantity} To Cart
  </button>
      </div>
    </div>
  );
}