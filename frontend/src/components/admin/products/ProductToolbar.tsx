
import {
  Search,
  Plus,
  RotateCcw,
  Filter,
} from "lucide-react";

import type { Category } from "../../../types/category";

interface ProductToolbarProps {
  search: string;
  onSearchChange: React.Dispatch<React.SetStateAction<string>>;
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: React.Dispatch<React.SetStateAction<string>>;
  status?: string;
  onStatusChange?: (status: string) => void;
  onAddProduct: () => void;
  onReset: () => void;
}

const controlClass =
  "min-h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10";

export default function ProductToolbar({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  status = "ALL",
  onStatusChange,
  onAddProduct,
  onReset,
}: ProductToolbarProps) {
  return (
    <section className="w-full min-w-0">
      {/* Toolbar heading */}
      <div className="mb-4 flex min-w-0 items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF8EE] text-[#0E4B32]">
          <Filter size={18} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-800 sm:text-base">
            Product Management
          </h2>
          <p className="text-xs text-gray-500">
            Search and filter your catalogue
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full min-w-0">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="search"
          aria-label="Search products"
          placeholder="Search products by name or SKU..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className={`${controlClass} pl-10`}
        />
      </div>

      {/* Filters */}
      <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_minmax(150px,0.8fr)_auto]">
        <div className="min-w-0">
          <label
            htmlFor="product-category-filter"
            className="mb-1.5 block text-xs font-semibold text-gray-500"
          >
            Category
          </label>

          <select
            id="product-category-filter"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className={controlClass}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {onStatusChange && (
          <div className="min-w-0">
            <label
              htmlFor="product-status-filter"
              className="mb-1.5 block text-xs font-semibold text-gray-500"
            >
              Product Status
            </label>

            <select
              id="product-status-filter"
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className={controlClass}
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="HIDDEN">Hidden</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        )}

        <div className="flex min-w-0 items-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 active:scale-[0.98] sm:w-full lg:w-auto"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Add product action */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onAddProduct}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#093b27] active:scale-[0.99] sm:w-auto"
        >
          <Plus size={19} />
          Add Product
        </button>
      </div>
    </section>
  );
}
