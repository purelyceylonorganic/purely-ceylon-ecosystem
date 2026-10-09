import { useEffect, useState } from "react";
import ProductCard from "../../components/product/ProductCard";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import type { Product } from "../../types/product.types";
import { setSEO } from "../../utils/seo";

type Category = {
  id: string;
  name: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  
useEffect(() => {
  setSEO({
    title: "Shop Organic Ceylon Spices & Tea | Purely Ceylon",
    description:
      "Shop premium Sri Lankan Ceylon spices, organic tea and natural products from Purely Ceylon Organic. Explore authentic products and discover their origins.",
    image: `${window.location.origin}/logo/pco-logo.png`,
    url: `${window.location.origin}/products`,
  });
}, []);


  async function loadCategories() {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await productService.getPublicProducts({
        page: 1,
        limit: 10,
      });

      const data = Array.isArray(response)
        ? response
        : (response as any).products;

      let filteredData: Product[] = data || [];

      if (search.trim()) {
        const searchTerm = search.trim().toLowerCase();

        filteredData = filteredData.filter((product: Product) =>
          product.name.toLowerCase().includes(searchTerm)
        );
      }

      if (selectedCategory) {
        filteredData = filteredData.filter(
          (product: Product) =>
            product.categoryId === selectedCategory
        );
      }

      setProducts(filteredData);
    } catch (err) {
      console.error(err);
      setError("Products load செய்ய முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory]);

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#0E4B32]/20 border-t-[#0E4B32]" />

          <p className="text-sm font-medium text-gray-600">
            Loading Products...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-red-600">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <main className="w-full min-w-0 overflow-x-hidden">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="mb-7 text-center sm:mb-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
          Purely Ceylon
        </p>

        <h1 className="text-3xl font-extrabold leading-tight text-[#0E4B32] sm:text-4xl lg:text-5xl">
          Our Products
        </h1>

        <p className="mx-auto mt-3 max-w-2xl px-2 text-sm leading-6 text-gray-500 sm:text-base">
          Premium Sri Lankan organic products, carefully selected
          for quality, freshness and export-grade standards.
        </p>
      </section>

      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_280px]">
          {/* Search */}

          <div className="relative">
            <label
              htmlFor="product-search"
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
            >
              Search Products
            </label>

            <input
              id="product-search"
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0E4B32] focus:bg-white focus:ring-2 focus:ring-[#0E4B32]/10"
            />
          </div>

          {/* Category */}

          <div>
            <label
              htmlFor="product-category"
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
            >
              Category
            </label>

            <select
              id="product-category"
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-[#0E4B32] focus:bg-white focus:ring-2 focus:ring-[#0E4B32]/10"
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter summary */}

        <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-[#0E4B32]">
              {products.length}
            </span>{" "}
            product{products.length === 1 ? "" : "s"}
          </p>

          {(search || selectedCategory) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
              }}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#0E4B32] hover:text-[#0E4B32] sm:w-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      {products.length === 0 ? (
        <section className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0E4B32]/10 text-2xl">
            🌿
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            No Products Found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            We couldn't find products matching your current
            search or category selection.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("");
            }}
            className="mt-6 rounded-full bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#111111]"
          >
            View All Products
          </button>
        </section>
      ) : (
        <section className="w-full min-w-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}