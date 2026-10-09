
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ProductForm from "../../../components/admin/products/ProductForm";
import { categoryService } from "../../../services/category.service";
import { productService } from "../../../services/product.service";
import type { Category } from "../../../types/category";

export default function CreateProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response = await categoryService.getAllCategories();

        if (active) {
          setCategories(response);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Failed to load categories");
      } finally {
        if (active) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  async function handleCreateProduct(data: any) {
    try {
      setLoading(true);

      await productService.createProduct(data);

      toast.success("Product created successfully");
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Product creation failed:", error);

      toast.error(
        error?.response?.data?.message ||
          "Product creation failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 p-3 sm:p-5 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-800">
            <PackagePlus size={23} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Create Product
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new product to your catalogue.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
        >
          <ArrowLeft size={17} />
          Back to Products
        </button>
      </div>

      {loadingCategories ? (
        <div
          className="flex min-h-40 items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600"
          role="status"
        >
          Loading categories...
        </div>
      ) : (
        <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5 lg:p-7">
          <ProductForm
            categories={categories}
            onSubmit={handleCreateProduct}
            loading={loading}
            submitText="Create Product"
          />
        </section>
      )}
    </main>
  );
}
