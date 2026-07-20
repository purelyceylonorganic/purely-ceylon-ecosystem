import type { Category } from "../../../types/category";

interface ProductToolbarProps {
  search: string;
  onSearchChange: React.Dispatch<React.SetStateAction<string>>;

  categories: Category[];
  selectedCategory: string;
  onCategoryChange: React.Dispatch<React.SetStateAction<string>>;

  onAddProduct: () => void;
  // புதிய onReset prop
  onReset: () => void;
}

export default function ProductToolbar({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  onAddProduct,
  onReset, // பெற்றுக் கொள்ளப்பட்டது
}: ProductToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-4 shadow md:flex-row md:items-center md:justify-between">
      {/* Search */}
      <div className="w-full md:w-96">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:outline-none"
        />
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-lg border px-4 py-2"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onReset} // Reset செயல்பாடு
          className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
          Reset
        </button>

        <button
          onClick={onAddProduct}
          className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
        >
          + Add Product
        </button>
      </div>
    </div>
  );
}