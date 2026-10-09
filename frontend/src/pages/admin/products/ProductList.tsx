
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Package,
  RefreshCw,
  Upload,
  EyeOff,
  Archive,
  X,
} from "lucide-react";

import { productService } from "../../../services/product.service";
import { categoryService } from "../../../services/category.service";
import useDebounce from "../../../hooks/useDebounce";

import type { Product } from "../../../types/product.types";
import type { Category } from "../../../types/category";

import ProductTable from "../../../components/admin/products/ProductTable";
import ProductToolbar from "../../../components/admin/products/ProductToolbar";
import ProductPagination from "../../../components/admin/products/ProductPagination";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, statusFilter]);

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await productService.getProducts({
        page,
        limit: 10,
        name: debouncedSearch || undefined,
        categoryId: selectedCategory || undefined,
      } as any);

      setProducts(response.products ?? []);
      setTotalPages(response.pagination?.totalPages ?? 1);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    }
  }

  useEffect(() => {
    void loadProducts();
  }, [page, debouncedSearch, selectedCategory]);

  useEffect(() => {
    void loadCategories();
  }, []);

  // Status filter currently applies to the products on this page.
  const filteredProducts = products.filter((product) => {
    if (statusFilter === "ALL") return true;
    return product.status === statusFilter;
  });

  function toggleProduct(id: string) {
    setSelectedProducts((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    );
  }

  function toggleAll() {
    const visibleIds = filteredProducts.map((product) => product.id);
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedProducts.includes(id));

    setSelectedProducts((previous) =>
      allVisibleSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : [...new Set([...previous, ...visibleIds])]
    );
  }

  async function bulkStatusUpdate(status: string) {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    try {
      setBulkLoading(true);

      await productService.bulkStatusUpdate({
        ids: selectedProducts,
        status,
      });

      toast.success("Products updated successfully");
      setSelectedProducts([]);
      await loadProducts();
    } catch (error) {
      console.error("Bulk status update failed:", error);
      toast.error("Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  }

  function handleReset() {
    setSearch("");
    setSelectedCategory("");
    setStatusFilter("ALL");
    setPage(1);
    setSelectedProducts([]);
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 sm:space-y-6">
      {/* Page heading */}
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0E4B32] text-white">
            <Package size={22} />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-[#0E4B32] sm:text-2xl">
              Products
            </h1>
            <p className="text-sm text-gray-500">
              Manage your product catalogue
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadProducts()}
          disabled={loading}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0E4B32] hover:bg-[#FFF8EE] disabled:opacity-60 sm:w-auto"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Products
        </button>
      </div>

      {/* Search, category and status filters */}
      <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-5">
        <ProductToolbar
          search={search}
          onSearchChange={setSearch}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          onAddProduct={() => navigate("/admin/products/create")}
          onReset={handleReset}
        />
      </div>

      {/* Bulk actions */}
      {selectedProducts.length > 0 && (
        <section className="min-w-0 rounded-2xl border border-[#D4AF37]/40 bg-[#FFF8EE] p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0E4B32] text-sm font-bold text-white">
                {selectedProducts.length}
              </span>

              <div>
                <p className="text-sm font-bold text-[#0E4B32]">
                  Products selected
                </p>
                <p className="text-xs text-gray-500">
                  Choose an action for the selected products.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedProducts([])}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-gray-600 hover:bg-white"
            >
              <X size={16} />
              Clear selection
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
            <button
              type="button"
              onClick={() => void bulkStatusUpdate("PUBLISHED")}
              disabled={bulkLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={16} />
              Publish
            </button>

            <button
              type="button"
              onClick={() => void bulkStatusUpdate("HIDDEN")}
              disabled={bulkLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <EyeOff size={16} />
              Hide
            </button>

            <button
              type="button"
              onClick={() => void bulkStatusUpdate("ARCHIVED")}
              disabled={bulkLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Archive size={16} />
              Archive
            </button>
          </div>

          {bulkLoading && (
            <p className="mt-3 text-center text-xs font-medium text-gray-600">
              Updating products...
            </p>
          )}
        </section>
      )}

      {/* Product table */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading && products.length > 0 && (
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
            <RefreshCw size={15} className="animate-spin" />
            Updating products...
          </div>
        )}

        {loading && products.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center text-[#0E4B32]">
            <RefreshCw size={25} className="animate-spin" />
            <p className="text-sm font-semibold">Loading products...</p>
          </div>
        ) : !loading && products.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
            <Package size={32} className="text-gray-300" />
            <p className="font-semibold text-gray-700">
              No products found
            </p>
            <p className="text-sm text-gray-500">
              Try changing your search or filters.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="min-h-10 rounded-lg bg-[#0E4B32] px-4 py-2 text-sm font-bold text-white"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="min-w-0">
            <ProductTable
              products={filteredProducts}
              onDeleteSuccess={loadProducts}
              selectedProducts={selectedProducts}
              toggleProduct={toggleProduct}
              toggleAll={toggleAll}
            />
          </div>
        )}
      </section>

      {/* Pagination */}
      <div className="min-w-0 overflow-x-auto pb-1">
        <ProductPagination
          page={page}
          totalPages={totalPages}
          onPageChange={(nextPage) => {
            setSelectedProducts([]);
            setPage(nextPage);
          }}
        />
      </div>
    </div>
  );
}
