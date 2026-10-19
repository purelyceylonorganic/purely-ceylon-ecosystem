import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";

import { productService } from "../../../services/product.service";
import { categoryService } from "../../../services/category.service";
import type { Category } from "../../../types/category";

type VariantForm = {
  id?: string;
  sku: string;
  weight: string;
  price: number;
  priceLKR: number;
  costPrice: number;
  stock: number;
};

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  status: string;
  categoryId: string;
  moq: number;
  variants: VariantForm[];
};

const emptyVariant = (): VariantForm => ({
  sku: "",
  weight: "",
  price: 0,
  priceLKR: 0,
  costPrice: 0,
  stock: 0,
});

const initialForm: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  status: "DRAFT",
  categoryId: "",
  moq: 1,
  variants: [emptyVariant()],
};

const inputClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!id) {
      toast.error("Product ID is missing");
      navigate("/admin/products");
      return;
    }

    setLoading(true);

    try {
      const [product, categoryResponse] = await Promise.all([
        productService.getProductById(id),
        categoryService.getAllCategories(),
      ]);

      const existingVariants: VariantForm[] = (
        product.variants ?? []
      ).map((variant: any) => ({
        id: variant.id,
        sku: variant.sku ?? "",
        weight: String(variant.weight ?? ""),
        price: Number(variant.price ?? 0),
        priceLKR: Number(variant.priceLKR ?? 0),
        costPrice: Number(variant.costPrice ?? 0),
        stock: Number(variant.stock ?? 0),
      }));

      setCategories(categoryResponse);

      setForm({
        name: product.name ?? "",
        slug: product.slug ?? "",
        description: product.description ?? "",
        status: (product as any).status ?? "DRAFT",
        categoryId:
          (product as any).categoryId ??
          (product as any).category?.id ??
          "",
        moq: Number(product.moq ?? 1),
        variants:
          existingVariants.length > 0
            ? existingVariants
            : [emptyVariant()],
      });
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  function handleChange(
    field: keyof Omit<ProductFormState, "variants">,
    value: string | number
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleVariantChange(
    index: number,
    field: keyof VariantForm,
    value: string | number
  ) {
    setForm((previous) => ({
      ...previous,
      variants: previous.variants.map((variant, variantIndex) =>
        variantIndex === index
          ? { ...variant, [field]: value }
          : variant
      ),
    }));
  }

  function addVariant() {
    setForm((previous) => ({
      ...previous,
      variants: [...previous.variants, emptyVariant()],
    }));
  }

  function removeVariant(index: number) {
    const variant = form.variants[index];

    // Existing database variants must not be silently removed.
    if (variant?.id) {
      toast.error(
        "Saved variants cannot be removed here. Clear or edit their details instead."
      );
      return;
    }

    if (form.variants.length <= 1) {
      toast.error("At least one variant is required");
      return;
    }

    setForm((previous) => ({
      ...previous,
      variants: previous.variants.filter(
        (_, variantIndex) => variantIndex !== index
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!id || saving) return;

    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Product name and slug are required");
      return;
    }

    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!Number.isInteger(form.moq) || form.moq < 1) {
      toast.error("MOQ must be a whole number greater than zero");
      return;
    }

    if (form.variants.length === 0) {
      toast.error("At least one variant is required");
      return;
    }

    const seenSkus = new Set<string>();

    for (const [index, variant] of form.variants.entries()) {
      const sku = variant.sku.trim();

      if (sku.length < 2 || !variant.weight.trim()) {
        toast.error(
          `Variant ${index + 1}: SKU and weight are required`
        );
        return;
      }

      if (seenSkus.has(sku)) {
        toast.error(`Duplicate SKU: ${sku}`);
        return;
      }

      seenSkus.add(sku);

      if (
        !Number.isFinite(variant.price) ||
        variant.price <= 0 ||
        !Number.isFinite(variant.priceLKR) ||
        variant.priceLKR <= 0 ||
        !Number.isFinite(variant.costPrice) ||
        variant.costPrice < 0 ||
        !Number.isInteger(variant.stock) ||
        variant.stock < 0
      ) {
        toast.error(
          `Variant ${index + 1}: Check USD, LKR, cost and stock values`
        );
        return;
      }
    }

    try {
      setSaving(true);

      await productService.updateProduct(id, {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description,
        status: form.status,
        categoryId: form.categoryId,
        moq: form.moq,
        variants: form.variants.map((variant) => ({
          ...(variant.id ? { id: variant.id } : {}),
          sku: variant.sku.trim(),
          weight: variant.weight.trim(),
          price: variant.price,
          priceLKR: variant.priceLKR,
          costPrice: variant.costPrice,
          stock: variant.stock,
        })),
      });

      toast.success("Product and variants updated successfully");
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Product update failed:", error);

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Product update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        className="flex min-h-64 items-center justify-center p-5 text-gray-600"
        role="status"
      >
        Loading product details...
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl min-w-0 p-3 sm:p-5 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Edit Product
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update product information, prices and inventory variants.
          </p>
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

      <form
        onSubmit={handleSubmit}
        className="min-w-0 space-y-6 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5 lg:p-7"
      >
        <section className="space-y-4">
          <h2 className="border-b border-gray-100 pb-3 text-lg font-semibold text-gray-900">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <label className={labelClass} htmlFor="product-name">
                Product Name *
              </label>
              <input
                id="product-name"
                className={inputClass}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="min-w-0">
              <label className={labelClass} htmlFor="product-slug">
                Slug *
              </label>
              <input
                id="product-slug"
                className={inputClass}
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                required
              />
            </div>

            <div className="min-w-0">
              <label className={labelClass} htmlFor="product-category">
                Category *
              </label>
              <select
                id="product-category"
                className={inputClass}
                value={form.categoryId}
                onChange={(e) =>
                  handleChange("categoryId", e.target.value)
                }
                required
              >
                <option value="">Select category</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className={labelClass} htmlFor="product-status">
                Product Status
              </label>
              <select
                id="product-status"
                className={inputClass}
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="HIDDEN">Hidden</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="min-w-0 sm:max-w-sm">
              <label className={labelClass} htmlFor="product-moq">
                Minimum Order Quantity (MOQ)
              </label>
              <input
                id="product-moq"
                className={inputClass}
                type="number"
                min={1}
                step={1}
                value={form.moq}
                onChange={(e) =>
                  handleChange("moq", Number(e.target.value))
                }
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="product-description">
              Description
            </label>
            <textarea
              id="product-description"
              className={`${inputClass} min-h-32 resize-y`}
              value={form.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
              placeholder="Describe the product..."
              rows={4}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Product Variants
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Set separate prices for Sri Lanka and international customers.
              </p>
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
            >
              <Plus size={17} />
              Add Variant
            </button>
          </div>

          {form.variants.map((variant, index) => (
            <div
              key={variant.id ?? `new-variant-${index}`}
              className="space-y-4 rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-800">
                  Variant {index + 1}
                  {variant.id ? (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      Existing
                    </span>
                  ) : (
                    <span className="ml-2 text-xs font-normal text-green-700">
                      New
                    </span>
                  )}
                </h3>

                {!variant.id && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    aria-label={`Remove new variant ${index + 1}`}
                    className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="min-w-0">
                  <label className={labelClass} htmlFor={`sku-${index}`}>
                    SKU *
                  </label>
                  <input
                    id={`sku-${index}`}
                    className={inputClass}
                    value={variant.sku}
                    onChange={(e) =>
                      handleVariantChange(index, "sku", e.target.value)
                    }
                    placeholder="e.g. PCO-TUR-100G"
                    required
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass} htmlFor={`weight-${index}`}>
                    Weight / Size *
                  </label>
                  <input
                    id={`weight-${index}`}
                    className={inputClass}
                    value={variant.weight}
                    onChange={(e) =>
                      handleVariantChange(index, "weight", e.target.value)
                    }
                    placeholder="e.g. 100g"
                    required
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass} htmlFor={`usd-${index}`}>
                    International Price (USD) *
                  </label>
                  <input
                    id={`usd-${index}`}
                    className={inputClass}
                    type="number"
                    min={0.01}
                    step="any"
                    value={variant.price}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "price",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass} htmlFor={`lkr-${index}`}>
                    Sri Lanka Price (LKR) *
                  </label>
                  <input
                    id={`lkr-${index}`}
                    className={inputClass}
                    type="number"
                    min={0.01}
                    step="any"
                    value={variant.priceLKR}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "priceLKR",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass} htmlFor={`cost-${index}`}>
                    Cost Price (LKR) *
                  </label>
                  <input
                    id={`cost-${index}`}
                    className={inputClass}
                    type="number"
                    min={0}
                    step="any"
                    value={variant.costPrice}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "costPrice",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass} htmlFor={`stock-${index}`}>
                    Stock Quantity *
                  </label>
                  <input
                    id={`stock-${index}`}
                    className={inputClass}
                    type="number"
                    min={0}
                    step={1}
                    value={variant.stock}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "stock",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="sticky bottom-0 -mx-3 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white/95 p-3 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:p-0 sm:pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            disabled={saving}
            className="min-h-11 w-full rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Update Product"}
          </button>
        </div>
      </form>
    </main>
  );
}