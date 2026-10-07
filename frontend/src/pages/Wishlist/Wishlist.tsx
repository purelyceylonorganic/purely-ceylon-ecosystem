import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  Scale,
  ArrowRight,
} from "lucide-react";

import { wishlistService } from "../../services/wishlist.service";
import { cartService } from "../../services/cart.service";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { refreshCart } = useCart();
  const { refreshWishlist } = useWishlist();

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

      await refreshWishlist();
    } catch (error) {
      console.error(error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      setProcessingId(id);

      await wishlistService.removeWishlist(id);

      await refreshWishlist();
      await loadWishlist();
    } catch (error) {
      console.error(error);
      alert("Remove failed.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleMoveToCart(item: any) {
    try {
      setProcessingId(item.id);

      if (!item.productVariant?.id) {
        alert("Product variant is unavailable.");
        return;
      }

      await cartService.addToCart(item.productVariant.id, 1);

      await wishlistService.removeWishlist(item.id);

      await Promise.all([
        refreshCart(),
        refreshWishlist(),
      ]);

      await loadWishlist();

      alert("🛒 Moved To Cart Successfully");
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Move to cart failed."
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#FFF8EE] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-5xl">
          <div className="animate-pulse">
            <div className="h-9 w-56 rounded-lg bg-gray-200" />
            <div className="mt-8 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-40 rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-[#FFF8EE] px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-7 text-center shadow-lg sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <Heart size={40} className="text-red-500" />
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-[#0E4B32] sm:text-3xl">
            My Wishlist
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
            Your wishlist is currently empty.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#111111] sm:w-auto"
          >
            <ShoppingCart size={18} />
            Browse Products
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] w-full overflow-x-hidden bg-[#FFF8EE] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Heart size={25} className="fill-red-500 text-red-500" />
              <h1 className="text-2xl font-extrabold text-[#0E4B32] sm:text-3xl">
                My Wishlist
              </h1>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {wishlist.length} saved{" "}
              {wishlist.length === 1 ? "product" : "products"}
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#0E4B32] px-4 py-2 text-sm font-bold text-[#0E4B32] transition hover:bg-[#0E4B32] hover:text-white"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Wishlist */}
        <div className="space-y-4">
          {wishlist.map((item: any) => {
            const product = item.productVariant?.product;
            const variant = item.productVariant;

            const image =
              product?.images?.find(
                (img: any) => img.isPrimary
              )?.url ||
              product?.images?.[0]?.url ||
              "/no-image.png";

            const isProcessing = processingId === item.id;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-5">

                  {/* Image */}
                  <Link
                    to={`/products/${product?.id}`}
                    className="mx-auto block shrink-0 sm:mx-0"
                  >
                    <img
                      src={image}
                      alt={product?.name || "Product"}
                      className="h-40 w-40 rounded-2xl object-cover bg-gray-50 sm:h-32 sm:w-32"
                      loading="lazy"
                    />
                  </Link>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${product?.id}`}
                      className="block"
                    >
                      <h2 className="text-lg font-extrabold text-gray-900 transition hover:text-[#0E4B32] sm:text-xl">
                        {product?.name || "Product"}
                      </h2>
                    </Link>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                      <p className="flex items-center gap-2">
                        <Package size={15} className="text-[#0E4B32]" />
                        <span>
                          <strong>SKU:</strong>{" "}
                          {variant?.sku || "N/A"}
                        </span>
                      </p>

                      <p className="flex items-center gap-2">
                        <Scale size={15} className="text-[#0E4B32]" />
                        <span>
                          <strong>Weight:</strong>{" "}
                          {variant?.weight || "N/A"}
                        </span>
                      </p>
                    </div>

                    <p className="mt-4 text-xl font-extrabold text-[#0E4B32]">
                      USD{" "}
                      {variant?.price !== undefined
                        ? Number(variant.price).toFixed(2)
                        : "N/A"}
                    </p>

                    {/* Buttons */}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleMoveToCart(item)}
                        className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        <ShoppingCart size={18} />
                        {isProcessing
                          ? "Processing..."
                          : "Move To Cart"}
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRemove(item.id)}
                        className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60 sm:w-auto"
                      >
                        <Trash2 size={17} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}