import { Link } from "react-router-dom";
import type { Product } from "../../types/product.types";
import "./ProductCard.css";
import { cartService } from "../../services/cart.service";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  async function handleAddToCart() {
  const variant = product.variants?.[0];

  if (!variant) {
    alert("No variant available.");
    return;
  }

  try {
    const response = await cartService.addToCart(
      variant.id,
      1
    );

    alert(response.message);
  } catch (error: any) {
    console.error(error);

    alert(
      error?.response?.data?.message ||
      "Add to cart failed."
    );
  }
}
  // Product Image
  const image =
    product.images.length > 0
      ? product.images[0].url
      : "/no-image.png";

  // First Variant
  const variant = product.variants?.[0];
  const variantWeight = (variant as any)?.weight ?? "N/A";

  return (
    <div className="product-card">
      {/* Product Image */}
      <img
        src={image}
        alt={product.name}
        className="product-image"
      />

      {/* Product Content */}
      <div className="product-content">
        {/* Organic Badge */}
        <span className="organic-badge">
          🌿 Organic
        </span>

        {/* Product Name */}
        <h3 className="product-name">
          {product.name}
        </h3>

        {/* Description */}
        <p className="product-description">
          {product.description}
        </p>

        {/* Price */}
        <p className="product-price">
          LKR {variant?.price?.toFixed(2) ?? "Price Not Available"}
        </p>

        {/* Weight */}
        <p className="product-weight">
          ⚖️ Weight : {variantWeight}
        </p>

        {/* Stock */}
        <p className="product-stock">
          📦 Stock : {variant?.stock ?? "N/A"}
        </p>

        {/* SKU */}
        <p className="product-sku">
          SKU : {variant?.sku ?? "N/A"}
        </p>

        {/* Buttons */}
        <div className="product-buttons">
          <Link
            to={`/products/${product.id}`}
            className="details-btn"
          >
            View Details
          </Link>

          <button
  className="cart-btn"
  onClick={handleAddToCart}
>
  Add to Cart
</button>
        </div>
      </div>
    </div>
  );
}