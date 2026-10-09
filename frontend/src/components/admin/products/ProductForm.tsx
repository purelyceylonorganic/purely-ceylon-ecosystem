
import { useForm } from "react-hook-form";
import {
  Package,
  Boxes,
  Save,
  LoaderCircle,
} from "lucide-react";

import type { Category } from "../../../types/category";

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  status: string;
  categoryId: string;
  moq: number;
  variant: {
    sku: string;
    weight: string;
    price: number;
    costPrice: number;
    stock: number;
  };
}

type ProductFormProps = {
  categories: Category[];
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  loading?: boolean;
  submitText?: string;
};

const inputClass =
  "min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-base text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:cursor-not-allowed disabled:bg-gray-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-gray-700";

export default function ProductForm({
  categories,
  defaultValues,
  onSubmit,
  loading = false,
  submitText = "Save Product",
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      status: "DRAFT",
      categoryId: "",
      moq: 1,
      variant: {
        sku: "",
        weight: "",
        price: 0,
        costPrice: 0,
        stock: 0,
      },
      ...defaultValues,
    },
  });

  const submitForm = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Product Submit Error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="mx-auto w-full min-w-0 max-w-5xl space-y-5 sm:space-y-6"
    >
      {/* Product Information */}
      <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF8EE] text-[#0E4B32]">
            <Package size={22} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0E4B32] sm:text-xl">
              Product Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the main product details.
            </p>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <div className="min-w-0">
            <label htmlFor="product-name" className={labelClass}>
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              autoComplete="off"
              placeholder="Enter product name"
              className={inputClass}
              {...register("name", {
                required: "Product name is required",
              })}
            />
            {errors.name && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="product-slug" className={labelClass}>
              Product Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="product-slug"
              type="text"
              autoComplete="off"
              placeholder="ceylon-tea"
              className={inputClass}
              {...register("slug", {
                required: "Slug is required",
              })}
            />
            {errors.slug && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.slug.message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="product-category" className={labelClass}>
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="product-category"
              className={inputClass}
              {...register("categoryId", {
                required: "Category is required",
              })}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="product-moq" className={labelClass}>
              Minimum Order Quantity (MOQ)
            </label>
            <input
              id="product-moq"
              type="number"
              min="1"
              placeholder="1"
              className={inputClass}
              {...register("moq", {
                required: "MOQ is required",
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: "MOQ must be at least 1",
                },
              })}
            />
            {errors.moq && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.moq.message}
              </p>
            )}
          </div>

          <div className="min-w-0 md:col-span-2">
            <label htmlFor="product-description" className={labelClass}>
              Product Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="product-description"
              rows={5}
              placeholder="Describe the product, its origin and key features..."
              className={`${inputClass} min-h-32 resize-y`}
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="min-w-0 md:col-span-2">
            <label htmlFor="product-status" className={labelClass}>
              Product Status
            </label>
            <select
              id="product-status"
              className={inputClass}
              {...register("status", {
                required: "Status is required",
              })}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="HIDDEN">Hidden</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            {errors.status && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
            <p className="mt-1.5 text-xs leading-5 text-gray-500">
              Publish the product only when its details and availability are ready.
            </p>
          </div>
        </div>
      </section>

      {/* Default Variant */}
      <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF8EE] text-[#0E4B32]">
            <Boxes size={22} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0E4B32] sm:text-xl">
              Default Variant
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Set SKU, weight, pricing and initial stock.
            </p>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <div className="min-w-0">
            <label htmlFor="variant-sku" className={labelClass}>
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              id="variant-sku"
              type="text"
              placeholder="TEA-100G"
              className={inputClass}
              {...register("variant.sku", {
                required: "SKU is required",
              })}
            />
            {errors.variant?.sku && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.variant.sku.message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="variant-weight" className={labelClass}>
              Weight <span className="text-red-500">*</span>
            </label>
            <input
              id="variant-weight"
              type="text"
              placeholder="100g"
              className={inputClass}
              {...register("variant.weight", {
                required: "Weight is required",
              })}
            />
            {errors.variant?.weight && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.variant.weight.message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="variant-price" className={labelClass}>
              Selling Price (USD) <span className="text-red-500">*</span>
            </label>
            <input
              id="variant-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="10.00"
              className={inputClass}
              {...register("variant.price", {
                required: "Selling price is required",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Price cannot be negative",
                },
              })}
            />
            {errors.variant?.price && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.variant.price.message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="variant-cost" className={labelClass}>
              Cost Price <span className="text-red-500">*</span>
            </label>
            <input
              id="variant-cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="5.00"
              className={inputClass}
              {...register("variant.costPrice", {
                required: "Cost price is required",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Cost price cannot be negative",
                },
              })}
            />
            {errors.variant?.costPrice && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.variant.costPrice.message}
              </p>
            )}
          </div>

          <div className="min-w-0 md:col-span-2">
            <label htmlFor="variant-stock" className={labelClass}>
              Initial Stock
            </label>
            <input
              id="variant-stock"
              type="number"
              min="0"
              placeholder="100"
              className={inputClass}
              {...register("variant.stock", {
                required: "Initial stock is required",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Stock cannot be negative",
                },
              })}
            />
            {errors.variant?.stock && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.variant.stock.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-gray-200 bg-[#FFF8EE]/95 p-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#093b27] disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto sm:min-w-52"
        >
          {loading ? (
            <>
              <LoaderCircle size={19} className="animate-spin" />
              Saving Product...
            </>
          ) : (
            <>
              <Save size={19} />
              {submitText}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
