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
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 mb-2">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left Side: Search, Categories, Status & Reset */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          {onStatusChange && (
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="HIDDEN">Hidden</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          )}

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-all cursor-pointer active:scale-95"
            title="Reset Filters"
          >
            Reset
          </button>
        </div>

        {/* Right Side: Add Product Button */}
        <div className="flex items-center justify-end">
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </button>
        </div>

      </div>
    </div>
  );
}