import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

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

  // Bulk Selection States
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
      setProducts(response.products);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [page, debouncedSearch, selectedCategory]);

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (statusFilter === "ALL") return true;
    return product.status === statusFilter;
  });

  function toggleProduct(id: string) {
    setSelectedProducts((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  function toggleAll() {
    if (selectedProducts.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  }

  async function bulkStatusUpdate(status: string) {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    try {
      setBulkLoading(true);
      await productService.bulkStatusUpdate({ ids: selectedProducts, status });
      toast.success("Products updated successfully");
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error(error);
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
  }

  if (loading && products.length === 0) return <div>Loading Products...</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar Section (Status-ஐ Props ஆக அனுப்புகிறோம்) */}
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

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 flex gap-3 flex-wrap">
          <button onClick={() => bulkStatusUpdate("PUBLISHED")} disabled={bulkLoading} className="bg-green-600 text-white px-4 py-2 rounded-lg">Publish</button>
          <button onClick={() => bulkStatusUpdate("HIDDEN")} disabled={bulkLoading} className="bg-gray-700 text-white px-4 py-2 rounded-lg">Hide</button>
          <button onClick={() => bulkStatusUpdate("ARCHIVED")} disabled={bulkLoading} className="bg-orange-600 text-white px-4 py-2 rounded-lg">Archive</button>
        </div>
      )}

      <ProductTable
        products={filteredProducts}
        onDeleteSuccess={loadProducts}
        selectedProducts={selectedProducts}
        toggleProduct={toggleProduct}
        toggleAll={toggleAll}
      />

      <ProductPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}