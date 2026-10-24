import { z } from "zod";


const productVariantSchema = z.object({
  id: z.string().uuid().optional(),

  sku: z.string().trim().min(2, "SKU must contain at least 2 characters"),

  weight: z.string().trim().min(1, "Weight is required"),

  // International price in USD
  price: z.number().positive("USD price must be greater than 0"),

  // Sri Lanka price in LKR
  priceLKR: z.number().positive("LKR price must be greater than 0"),

  costPrice: z.number().min(0, "Cost price cannot be negative"),

  stock: z.number().int().min(0, "Stock cannot be negative"),

  // Package weight (product + packaging) in grams — shipping கணக்குக்கு
  weightGrams: z.number().int().min(0, "Weight cannot be negative").optional(),
});


const productFieldsSchema = {
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters")
    .max(200),

  slug: z
    .string()
    .trim()
    .min(3)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can contain only lowercase letters, numbers and hyphens"
    ),

  description: z
    .string({
      error: "Product description is required",
    })
    .trim()
    .min(10, "Description must contain at least 10 characters")
    .max(5000, "Description cannot exceed 5000 characters"),

  categoryId: z.string().uuid("Invalid Category ID"),

  moq: z.number().int().min(1),

  images: z.array(z.string().url()).optional(),

  videos: z.array(z.string().url()).optional(),
};

export const createProductSchema = z
  .object({
    ...productFieldsSchema,

    // New format: multiple variants
    variants: z.array(productVariantSchema).min(1).optional(),

    // Legacy format: one variant
    variant: productVariantSchema.optional(),
  })
  .refine(
    (data) =>
      (data.variants !== undefined && data.variants.length > 0) ||
      data.variant !== undefined,
    {
      message: "At least one product variant is required",
      path: ["variants"],
    }
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;