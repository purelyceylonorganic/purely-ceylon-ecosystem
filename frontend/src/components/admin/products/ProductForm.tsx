import { useForm } from "react-hook-form";
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

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        try {
          await onSubmit(data);
        } catch (error) {
          console.error("Product Submit Error:", error);
        }
      })}
      className="bg-white rounded-xl shadow-lg p-8 space-y-8"
    >
      {/* Product Information */}
      <div>
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          Product Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Product Name */}
          <div>
            <label className="block mb-2 font-medium">Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              className="w-full border rounded-lg p-3"
              {...register("name", { required: "Product name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block mb-2 font-medium">Slug</label>
            <input
              type="text"
              placeholder="ceylon-tea"
              className="w-full border rounded-lg p-3"
              {...register("slug", { required: "Slug is required" })}
            />
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 font-medium">Category</label>
            <select
              className="w-full border rounded-lg p-3"
              {...register("categoryId", { required: "Category required" })}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* MOQ */}
          <div>
            <label className="block mb-2 font-medium">
              Minimum Order Quantity (MOQ)
            </label>
            <input
              type="number"
              placeholder="1"
              className="w-full border rounded-lg p-3"
              {...register("moq", { required: true, valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            rows={5}
            placeholder="Product description"
            className="w-full border rounded-lg p-3"
            {...register("description", { required: "Description required" })}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
        <div className="mt-5">
  <label className="block font-medium mb-2">Product Status</label>
  <select
    className="w-full border rounded-lg p-3"
    {...register("status", { required: "Status is required" })}
  >
    <option value="DRAFT">Draft</option>
    <option value="PUBLISHED">Published</option>
    <option value="HIDDEN">Hidden</option>
    <option value="ARCHIVED">Archived</option>
  </select>
  {errors.status && (
    <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
  )}
</div>
      </div>

      {/* Variant Information */}
      <div>
        <h2 className="text-xl font-bold mb-5 text-gray-800">Default Variant</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* SKU */}
          <div>
            <label className="block mb-2 font-medium">SKU</label>
            <input
              type="text"
              placeholder="Example: TEA-100G"
              className="w-full border rounded-lg p-3"
              {...register("variant.sku", { required: "SKU is required" })}
            />
            {errors.variant?.sku && (
              <p className="text-red-500 text-sm mt-1">
                {errors.variant.sku.message}
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block mb-2 font-medium">Weight</label>
            <input
              type="text"
              placeholder="100g"
              className="w-full border rounded-lg p-3"
              {...register("variant.weight", { required: "Weight is required" })}
            />
            {errors.variant?.weight && (
              <p className="text-red-500 text-sm mt-1">
                {errors.variant.weight.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block mb-2 font-medium">Selling Price (USD)</label>
            <input
              type="number"
              step="0.01"
              placeholder="10"
              className="w-full border rounded-lg p-3"
              {...register("variant.price", { required: true, valueAsNumber: true })}
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="block mb-2 font-medium">Cost Price</label>
            <input
              type="number"
              step="0.01"
              placeholder="5"
              className="w-full border rounded-lg p-3"
              {...register("variant.costPrice", { required: true, valueAsNumber: true })}
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block mb-2 font-medium">Initial Stock</label>
            <input
              type="number"
              placeholder="100"
              className="w-full border rounded-lg p-3"
              {...register("variant.stock", { required: true, valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-lg font-bold text-white transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
        }`}
      >
        {loading ? "Saving Product..." : submitText}
      </button>
    </form>
  );
}