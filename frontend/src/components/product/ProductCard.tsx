import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Eye,
  Package,
  Scale,
} from "lucide-react";

import type { Product } from "../../types/product.types";
import "./ProductCard.css";

import { cartService } from "../../services/cart.service";
import { wishlistService } from "../../services/wishlist.service";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const variant = product.variants?.[0];

  const image =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/no-image.png";

  const price = variant?.price;
  const weight = (variant as any)?.weight;
  const stock = variant?.stock ?? 0;

  async function handleAddToCart() {
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

  async function handleAddToWishlist() {
    if (!variant) {
      alert("No variant available.");
      return;
    }

    try {
      const response =
        await wishlistService.addToWishlist(
          variant.id
        );

      alert(response.message);

      window.location.reload();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Add to wishlist failed."
      );
    }
  }

  return (
    <article className="product-card">
      {/* ================= IMAGE ================= */}
      <div className="product-image-wrapper">
        <img
          src={image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        <span className="organic-badge">
          🌿 Organic
        </span>

        <button
          type="button"
          onClick={handleAddToWishlist}
          aria-label={`Add ${product.name} to wishlist`}
          className="wishlist-icon-btn"
        >
          <Heart size={18} />
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="product-content">
        {product.category?.name && (
          <p className="product-category">
            {product.category.name}
          </p>
        )}

        <h3 className="product-name">
          {product.name}
        </h3>

        {product.description && (
          <p className="product-description">
            {product.description}
          </p>
        )}

        {/* ================= PRICE ================= */}
        <div className="product-price-row">
          <p className="product-price">
            {price !== undefined
              ? `LKR ${Number(price).toLocaleString(
                  "en-LK",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`
              : "Price unavailable"}
          </p>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="product-meta">
          <span>
            <Scale size={15} />
            {weight ?? "N/A"}
          </span>

          <span
            className={
              stock > 0
                ? "stock-in"
                : "stock-out"
            }
          >
            <Package size={15} />
            {stock > 0
              ? `${stock} in stock`
              : "Out of stock"}
          </span>
        </div>

        {variant?.sku && (
          <p className="product-sku">
            SKU: {variant.sku}
          </p>
        )}

        {/* ================= ACTIONS ================= */}
        <div className="product-buttons">
          <Link
            to={`/products/${product.id}`}
            className="details-btn"
          >
            <Eye size={17} />
            <span>View</span>
          </Link>

          <button
            type="button"
            className="cart-btn"
            onClick={handleAddToCart}
            disabled={!variant || stock <= 0}
          >
            <ShoppingCart size={17} />
            <span>
              {stock > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}