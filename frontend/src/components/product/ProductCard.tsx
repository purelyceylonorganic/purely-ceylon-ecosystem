import { Link } from "react-router-dom";
import type { Product } from "../../types/product.types";
import "./ProductCard.css";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const image =
    product.images.length > 0
      ? product.images[0].url
      : "https://via.placeholder.com/300x300?text=No+Image";

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

        <span className="organic-badge">
          🌿 Organic
        </span>

        <h3 className="product-name">
          {product.name}
        </h3>

        <p className="product-price">
          LKR {product.basePrice.toFixed(2)}
        </p>

        <p className="product-stock">
          📦 Stock : {product.stock}
        </p>

        <div className="product-buttons">

          <Link
            to={`/products/${product.id}`}
            className="details-btn"
          >
            View Details
          </Link>

          <button
            className="cart-btn"
          >
            Add Cart
          </button>

        </div>

      </div>
    </div>
  );
}