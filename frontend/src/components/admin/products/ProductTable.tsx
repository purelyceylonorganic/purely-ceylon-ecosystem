
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Eye,
  Pencil,
  Images,
  Trash2,
  MoreVertical,
  Star,
  EyeOff,
  Archive,
  CheckCircle,
  LoaderCircle,
  Package,
} from "lucide-react";

import type { Product } from "../../../types/product.types";
import { productService } from "../../../services/product.service";

interface ProductTableProps {
  products: Product[];
  onDeleteSuccess?: () => void;
  selectedProducts: string[];
  toggleProduct: (id: string) => void;
  toggleAll: () => void;
}

type ProductStatus = "PUBLISHED" | "DRAFT" | "HIDDEN" | "ARCHIVED";

export default function ProductTable({
  products,
  onDeleteSuccess,
  selectedProducts,
  toggleProduct,
  toggleAll,
}: ProductTableProps) {
  const navigate = useNavigate();

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const visibleIds = products.map((product) => product.id);
  const isAllSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedProducts.includes(id));

  async function updateStatus(id: string, status: ProductStatus) {
    try {
      setActionLoadingId(id);

      await productService.updateProduct(id, { status });

      toast.success(`Product ${status.toLowerCase()} successfully`);
      setOpenDropdownId(null);
      onDeleteSuccess?.();
    } catch (error) {
      console.error("Product status update failed:", error);
      toast.error("Status update failed");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function toggleFeatured(id: string) {
    try {
      setActionLoadingId(id);

      await productService.toggleFeatured(id);

      toast.success("Featured status updated");
      setOpenDropdownId(null);
      onDeleteSuccess?.();
    } catch (error) {
      console.error("Featured update failed:", error);
      toast.error("Failed to update featured status");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      setActionLoadingId(id);

      await productService.deleteProduct(id);

      toast.success("Product deleted successfully");
      setOpenDropdownId(null);
      onDeleteSuccess?.();
    } catch (error) {
      console.error("Product deletion failed:", error);
      toast.error("Delete failed");
    } finally {
      setActionLoadingId(null);
    }
  }

  
function getProductValues(product: Product) {
  const defaultVariant =
    product.variants?.[0] || (product as any).variant;

  const imageUrl =
    (product as any).imageUrl ||
    product.images?.find((image) => image.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.png";

  // Prefer values saved in ProductVariant
  const sku = defaultVariant?.sku || product.sku || "N/A";
  const weight = defaultVariant?.weight ?? product.weight;
  const price = defaultVariant?.price ?? product.price ?? 0;
  const stock = defaultVariant?.stock ?? product.stock ?? 0;

  const category =
    typeof product.category === "object" && product.category !== null
      ? (product.category as any).name
      : product.categoryId || "N/A";

  return {
    imageUrl,
    sku,
    weight,
    price,
    stock,
    category,
  };
}


  function statusClasses(status: string) {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-50 text-emerald-700";
      case "DRAFT":
        return "bg-amber-50 text-amber-700";
      case "HIDDEN":
        return "bg-gray-100 text-gray-700";
      case "ARCHIVED":
        return "bg-orange-50 text-orange-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  function ProductActions({ product }: { product: Product }) {
    const isLoading = actionLoadingId === product.id;
    const dropdownOpen = openDropdownId === product.id;

    return (
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(`/products/${product.id}`)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          aria-label={`View ${product.name}`}
        >
          <Eye size={16} />
          <span>View</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          aria-label={`Edit ${product.name}`}
        >
          <Pencil size={16} />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/admin/products/${product.id}/images`)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-purple-50 px-3 text-sm font-semibold text-purple-700 hover:bg-purple-100"
          aria-label={`Manage images for ${product.name}`}
        >
          <Images size={16} />
          <span>Images</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => void handleDelete(product.id, product.name)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
          aria-label={`Delete ${product.name}`}
        >
          {isLoading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
          <span>{isLoading ? "Please wait" : "Delete"}</span>
        </button>

        <div className="relative">
          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              setOpenDropdownId(dropdownOpen ? null : product.id)
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            aria-label={`More actions for ${product.name}`}
            aria-expanded={dropdownOpen}
          >
            <MoreVertical size={17} />
            More
          </button>

          {dropdownOpen && (
            <>
              <button
                type="button"
                aria-label="Close actions menu"
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setOpenDropdownId(null)}
              />

              <div className="absolute right-0 top-full z-40 mt-2 w-52 max-w-[85vw] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-left shadow-xl">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => void toggleFeatured(product.id)}
                  className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Star size={16} className="text-amber-500" />
                  {product.featured ? "Remove Featured" : "Mark Featured"}
                </button>

                {product.status !== "PUBLISHED" && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => void updateStatus(product.id, "PUBLISHED")}
                    className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    Publish
                  </button>
                )}

                {product.status !== "HIDDEN" && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => void updateStatus(product.id, "HIDDEN")}
                    className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <EyeOff size={16} />
                    Hide
                  </button>
                )}

                {product.status !== "ARCHIVED" && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => void updateStatus(product.id, "ARCHIVED")}
                    className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-sm text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                  >
                    <Archive size={16} />
                    Archive
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {/* MOBILE PRODUCT CARDS */}
      <div className="grid min-w-0 grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 md:hidden">
        {products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-3 px-4 py-12 text-center text-gray-500">
            <Package size={36} className="text-gray-300" />
            <p className="font-semibold">No products found.</p>
          </div>
        ) : (
          products.map((product) => {
            const values = getProductValues(product);
            const isSelected = selectedProducts.includes(product.id);
            const isLoading = actionLoadingId === product.id;

            return (
              <article
                key={product.id}
                className="min-w-0 overflow-visible rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleProduct(product.id)}
                    aria-label={`Select ${product.name}`}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#0E4B32]"
                  />

                  <img
                    src={values.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/placeholder.png";
                    }}
                    className="h-20 w-20 shrink-0 rounded-xl border border-gray-100 bg-gray-50 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-bold leading-5 text-gray-900">
                      {product.name}
                    </h3>

                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses(product.status)}`}
                    >
                      {product.status}
                    </span>

                    {product.featured && (
                      <p className="mt-1 text-xs font-semibold text-amber-600">
                        ★ Featured
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="mt-1 break-words text-sm font-medium text-gray-800">
                      {values.category}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">SKU</p>
                    <p className="mt-1 break-all font-mono text-xs text-gray-700">
                      {values.sku}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {values.weight
                        ? String(values.weight).includes("g")
                          ? values.weight
                          : `${values.weight}g`
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Stock</p>
                    <p
                      className={`mt-1 text-sm font-bold ${
                        Number(values.stock) > 0
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {values.stock}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl bg-[#FFF8EE] p-3">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="mt-1 break-words text-lg font-extrabold text-[#0E4B32]">
                      Rs. {Number(values.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 border-t border-gray-100 pt-3">
                  <ProductActions product={product} />
                  {isLoading && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <LoaderCircle size={14} className="animate-spin" />
                      Updating product...
                    </p>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* TABLET AND DESKTOP TABLE */}
      <div className="hidden min-w-0 overflow-x-auto md:block">
        <table className="w-full min-w-[950px] border-collapse text-left">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleAll}
                  aria-label="Select all visible products"
                  className="h-4 w-4 cursor-pointer accent-[#0E4B32]"
                />
              </th>
              <th className="p-4">Name &amp; Status</th>
              <th className="p-4">Category</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Weight</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const values = getProductValues(product);

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-[#FFF8EE]/50"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        aria-label={`Select ${product.name}`}
                        className="h-4 w-4 cursor-pointer accent-[#0E4B32]"
                      />
                    </td>

                    <td className="p-4">
                      <div className="flex min-w-[190px] items-center gap-3">
                        <img
                          src={values.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/placeholder.png";
                          }}
                          className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 bg-gray-50 object-cover"
                        />

                        <div className="min-w-0">
                          <p className="line-clamp-2 font-semibold text-gray-900">
                            {product.name}
                          </p>
                          <span
                            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(product.status)}`}
                          >
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="max-w-40 p-4 text-gray-600">
                      <span className="break-words">{values.category}</span>
                    </td>

                    <td className="p-4 font-mono text-xs text-gray-500">
                      {values.sku}
                    </td>

                    <td className="whitespace-nowrap p-4 text-gray-600">
                      {values.weight
                        ? String(values.weight).includes("g")
                          ? values.weight
                          : `${values.weight}g`
                        : "N/A"}
                    </td>

                    <td className="whitespace-nowrap p-4 text-right font-semibold text-gray-900">
                      Rs. {Number(values.price).toFixed(2)}
                    </td>

                    <td className="p-4 text-right">
                      <span
                        className={`font-semibold ${
                          Number(values.stock) > 0
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {values.stock}
                      </span>
                    </td>

                    <td className="min-w-[260px] p-4">
                      <ProductActions product={product} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
