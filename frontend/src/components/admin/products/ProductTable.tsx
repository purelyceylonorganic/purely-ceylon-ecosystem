import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { Product } from "../../../types/product.types";
import { productService } from "../../../services/product.service";

interface ProductTableProps {
  products: Product[];
  onDeleteSuccess?: () => void;
  selectedProducts: string[];
  toggleProduct: (id: string) => void;
  toggleAll: () => void;
}

export default function ProductTable({
  products,
  onDeleteSuccess,
  selectedProducts,
  toggleProduct,
  toggleAll,
}: ProductTableProps) {
  const navigate = useNavigate();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const isAllSelected =
    products.length > 0 && selectedProducts.length === products.length;
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  async function updateStatus(
    id: string,
    status: "PUBLISHED" | "DRAFT" | "HIDDEN" | "ARCHIVED"
  ) {
    try {
      setActionLoadingId(id);
      await productService.updateProduct(id, { status });
      toast.success(`Product ${status.toLowerCase()} successfully`);
      onDeleteSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Status update failed");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function toggleFeatured(id: string) {

  try {

    await productService.toggleFeatured(id);

    toast.success(
      "Featured status updated"
    );

    onDeleteSuccess?.();

  } catch (error) {

    console.error(error);

    toast.error(
      "Failed to update featured status"
    );

  }

}

  async function handleDelete(id: string, name: string) {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmDelete) return;

    try {
      setActionLoadingId(id);
      await productService.deleteProduct(id);
      toast.success("Product deleted successfully");
      onDeleteSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleAll}
                  className="rounded border-gray-300 cursor-pointer accent-indigo-600"
                />
              </th>
              <th className="p-4">Name & Status</th>
              <th className="p-4">Category</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Weight</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Stock</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500 font-medium">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => {
  const isSelected = selectedProducts.includes(product.id);
  const isLoading = actionLoadingId === product.id;

  // Status Badge Color Selection
  let badgeColor = "bg-gray-100 text-gray-800";
  if (product.status === "PUBLISHED") badgeColor = "bg-green-100 text-green-800";
  else if (product.status === "DRAFT") badgeColor = "bg-yellow-100 text-yellow-800";
  else if (product.status === "HIDDEN") badgeColor = "bg-gray-200 text-gray-700";
  else if (product.status === "ARCHIVED") badgeColor = "bg-orange-100 text-orange-800";

  // Safe image resolution matching the Product type definition
  const imageUrl =
    (product as any).imageUrl ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.png";

  // Get Default Variant safely without TypeScript error
  const defaultVariant = product.variants?.[0] || (product as any).variant;

  // Extracted values with fallbacks
  const sku = product.sku || defaultVariant?.sku || "N/A";
  const weight = product.weight || defaultVariant?.weight;
  const price = product.price ?? defaultVariant?.price ?? 0;
  const stock = product.stock ?? defaultVariant?.stock ?? 0;

  return (
    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
      {/* Checkbox */}
      <td className="p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleProduct(product.id)}
          className="rounded border-gray-300 cursor-pointer accent-indigo-600"
        />
      </td>

      {/* Name & Image & Status */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
          />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-gray-900 line-clamp-1">{product.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium w-max ${badgeColor}`}>
              {product.status}
            </span>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="p-4 text-gray-600">
        {typeof product.category === 'object' && product.category !== null
          ? (product.category as any)?.name
          : product.categoryId || "N/A"}
      </td>

      {/* SKU */}
      <td className="p-4 text-gray-500 font-mono text-xs">
        {sku}
      </td>

      {/* Weight */}
      <td className="p-4 text-gray-600">
        {weight ? (String(weight).includes('g') ? weight : `${weight}g`) : "N/A"}
      </td>

      {/* Price (Right Aligned) */}
      <td className="p-4 text-right font-semibold text-gray-900">
        Rs. {Number(price).toFixed(2)}
      </td>

      {/* Stock (Right Aligned) */}
      <td className="p-4 text-right">
        <span className={`font-semibold ${Number(stock) > 0 ? "text-emerald-600" : "text-red-500"}`}>
          {stock}
        </span>
      </td>

      {/* Actions Column */}
<td className="p-4 text-center relative">
  <div className="flex items-center justify-center gap-1.5">
    {/* 1. View Button */}
    <button
      onClick={() => navigate(`/products/${product.id}`)}
      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
      title="View"
    >
      👁️
    </button>

    {/* 2. Edit Button */}
    <button
      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition"
      title="Edit"
    >
      ✏️
    </button>

    {/* 3. Images Button */}
    <button
      onClick={() => navigate(`/admin/products/${product.id}/images`)}
      className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded transition"
      title="Images"
    >
      🖼️
    </button>

    {/* 4. Delete Button */}
    <button
      disabled={isLoading}
      onClick={() => handleDelete(product.id, product.name)}
      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded transition"
      title="Delete"
    >
      🗑️
    </button>

    {/* 5. More Actions Dropdown (⋮) */}
    <div className="relative">
      <button
        onClick={() => setOpenDropdownId(openDropdownId === product.id ? null : product.id)}
        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition font-bold"
        title="More Actions"
      >
        ⋮
      </button>

      {/* Dropdown Menu */}
      {openDropdownId === product.id && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-left">
          {/* Feature Toggle */}
          <button
            onClick={() => {
              toggleFeatured(product.id);
              setOpenDropdownId(null);
            }}
            className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            {product.featured ? "⭐ Remove Featured" : "⭐ Mark Featured"}
          </button>

          {/* Publish Action */}
          {product.status !== "PUBLISHED" && (
            <button
              disabled={isLoading}
              onClick={() => {
                updateStatus(product.id, "PUBLISHED");
                setOpenDropdownId(null);
              }}
              className="w-full px-4 py-2 text-xs text-green-700 hover:bg-green-50 flex items-center gap-2 font-medium"
            >
              🟢 Publish
            </button>
          )}

          {/* Hide Action */}
          {product.status !== "HIDDEN" && (
            <button
              disabled={isLoading}
              onClick={() => {
                updateStatus(product.id, "HIDDEN");
                setOpenDropdownId(null);
              }}
              className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 font-medium"
            >
              ⚫ Hide
            </button>
          )}

          {/* Archive Action */}
          {product.status !== "ARCHIVED" && (
            <button
              disabled={isLoading}
              onClick={() => {
                updateStatus(product.id, "ARCHIVED");
                setOpenDropdownId(null);
              }}
              className="w-full px-4 py-2 text-xs text-orange-700 hover:bg-orange-50 flex items-center gap-2 font-medium"
            >
              🟠 Archive
            </button>
          )}
        </div>
      )}
    </div>
  </div>
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