import type { Product } from "../../../types/product.types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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

  async function handleDelete(id: string, name: string) {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmDelete) return;

    try {
      await productService.deleteProduct(id);
      toast.success("Product deleted successfully");
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (error) {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">
              <input
                type="checkbox"
                checked={selectedProducts.length === products.length && products.length > 0}
                onChange={toggleAll}
              />
            </th>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-left">SKU</th>
            <th className="p-4 text-left">Weight</th>
            <th className="p-4 text-left">Price</th>
            <th className="p-4 text-left">Stock</th>
            <th className="p-4 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t hover:bg-gray-50">
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleProduct(product.id)}
                />
              </td>
              <td className="p-4 font-medium">
                <div className="flex flex-col gap-2">
                  <span>{product.name}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold w-max ${
                      product.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                      product.status === "DRAFT" ? "bg-yellow-100 text-yellow-700" :
                      product.status === "HIDDEN" ? "bg-gray-200 text-gray-700" :
                      "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.status || "N/A"}
                  </span>
                </div>
              </td>
              <td className="p-4">{product.category?.name || "N/A"}</td>
              <td className="p-4">{product.variants?.[0]?.sku || "-"}</td>
              <td className="p-4">{product.variants?.[0]?.weight || "-"}</td>
              <td className="p-4">${product.variants?.[0]?.price || 0}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-sm ${(product.variants?.[0]?.stock || 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {product.variants?.[0]?.stock || 0}
                </span>
              </td>
              <td className="p-4">
                <button onClick={() => navigate(`/products/${product.id}`)} className="bg-blue-600 text-white px-3 py-1 rounded mr-2">View</button>
                <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                <button onClick={() => navigate(`/admin/products/${product.id}/images`)} className="bg-purple-600 text-white px-3 py-1 rounded ml-2">Images</button>
                <button onClick={() => handleDelete(product.id, product.name)} className="bg-red-600 text-white px-3 py-1 rounded ml-2">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}