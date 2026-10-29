import { useForm, useFieldArray } from "react-hook-form";
import {
  Package,
  Boxes,
  Save,
  LoaderCircle,
} from "lucide-react";

import type { Category } from "../../../types/category";
import ProductDescriptionEditor from "../ProductDescriptionEditor";
import { toSlug } from "../../../utils/slug";

export interface ProductVariantFormData {
  id?: string;
  sku: string;
  weight: string;
  price: number;
  priceLKR: number;
  costPrice: number;
  stock: number;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  status: string;
  categoryId: string;
  moq: number;
  variants: ProductVariantFormData[];
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
  control,
  handleSubmit,
  watch,
  setValue,
  getValues,
  formState: { errors },
} = useForm<ProductFormData>({
  defaultValues: {
    name: "",
    slug: "",
    description: "",
    status: "DRAFT",
  // import ProductDescriptionEditor from
  //   "./components/admin/ProductDescriptionEditor";
    variants: [
      {
        sku: "",
        weight: "",
        price: 0,
        priceLKR: 0,
        costPrice: 0,
        stock: 0,
      },
    ],
    ...defaultValues,
  },
});

const {
  fields: variantFields,
  append: appendVariant,
  remove: removeVariant,
} = useFieldArray({
  control,
  name: "variants",
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
    onBlur: (e) => {
      if (!getValues("slug")) {
        setValue("slug", toSlug(e.target.value), {
          shouldValidate: true,
        });
      }
    },
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
    setValueAs: (v: string) => v.trim().toLowerCase(),
    pattern: {
      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      message: "சிறிய ஆங்கில எழுத்துகள், எண்கள், இடைக்கோடு (-) மட்டும்",
    },
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

  {/* Register description in React Hook Form */}
  <input
    type="hidden"
    {...register("description", {
      validate: (value) => {
        const text = value
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim();

        const hasImage = /<img\b/i.test(value);

        return (
          text.length > 0 ||
          hasImage ||
          "Description is required"
        );
      },
    })}
  />

  <ProductDescriptionEditor
    value={watch("description") ?? ""}
    onChange={(html) =>
      setValue("description", html, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
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

      {/* Multiple Product Variants */}
<section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
  <div className="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF8EE] text-[#0E4B32]">
        <Boxes size={22} />
      </div>
      <div>
        <h2 className="text-lg font-extrabold text-[#0E4B32] sm:text-xl">
          Product Variants
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Add different weights, SKUs, prices and stock levels.
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={() =>
        appendVariant({
          sku: "",
          weight: "",
          price: 0,
          priceLKR: 0,
          costPrice: 0,
          stock: 0,
        })
      }
      className="min-h-11 rounded-xl bg-[#0E4B32] px-4 py-2 text-sm font-bold text-white hover:bg-[#093b27]"
    >
      + Add Variant
    </button>
  </div>

  <div className="space-y-5">
    {variantFields.map((field, index) => (
      <div
        key={field.id}
        className="min-w-0 rounded-xl border border-gray-200 p-4 sm:p-5"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-bold text-gray-800">
            Variant {index + 1}
          </h3>

          {variantFields.length > 1 && (
            <button
              type="button"
              onClick={() => removeVariant(index)}
              className="min-h-10 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label className={labelClass}>SKU *</label>
            <input
              {...register(`variants.${index}.sku`, {
                required: "SKU is required",
              })}
              placeholder="TUR-100G"
              className={inputClass}
            />
            {errors.variants?.[index]?.sku && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.variants[index]?.sku?.message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label className={labelClass}>Weight *</label>
            <input
              {...register(`variants.${index}.weight`, {
                required: "Weight is required",
              })}
              placeholder="100g"
              className={inputClass}
            />
            {errors.variants?.[index]?.weight && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.variants[index]?.weight?.message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label className={labelClass}>Sri Lanka Price (LKR) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register(`variants.${index}.priceLKR`, {
                required: "Sri Lanka price (LKR) is required",
                valueAsNumber: true,
                min: { value: 0.01, message: "LKR price must be greater than 0" },
              })}
              className={inputClass}
            />
            {errors.variants?.[index]?.priceLKR && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.variants[index]?.priceLKR?.message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label className={labelClass}>International Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register(`variants.${index}.price`, {
                required: "International price (USD) is required",
                valueAsNumber: true,
                min: { value: 0.01, message: "USD price must be greater than 0" },
              })}
              className={inputClass}
            />
            {errors.variants?.[index]?.price && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.variants[index]?.price?.message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label className={labelClass}>Cost Price (LKR) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register(`variants.${index}.costPrice`, {
                required: "Cost price is required",
                valueAsNumber: true,
                min: { value: 0, message: "Cost cannot be negative" },
              })}
              className={inputClass}
            />
            {errors.variants?.[index]?.costPrice && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.variants[index]?.costPrice?.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Your own cost in LKR. Customers never see this.
            </p>
          </div>

          <div className="min-w-0">
            <label className={labelClass}>Initial Stock *</label>
            <input
              type="number"
              min="0"
              {...register(`variants.${index}.stock`, {
                required: "Initial stock is required",
                valueAsNumber: true,
                min: { value: 0, message: "Stock cannot be negative" },
              })}
              className={inputClass}
            />
            {errors.variants?.[index]?.stock && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.variants[index]?.stock?.message}
              </p>
            )}
          </div>
        </div>
      </div>
    ))}
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