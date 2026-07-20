import { z } from "zod";

export const createProductSchema = z.object({
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
    .string()
    .trim()
    .min(10),

  categoryId: z
    .string()
    .uuid("Invalid Category ID"),

  moq: z
    .number()
    .int()
    .min(1),

  variant: z.object({

    sku: z
      .string()
      .trim()
      .min(2),

    weight: z
      .string()
      .trim()
      .min(1),

    price: z
      .number()
      .positive(),

    costPrice: z
      .number()
      .min(0),

    stock: z
      .number()
      .int()
      .min(0),

  }),

  images: z
    .array(z.string().url())
    .optional(),

  videos: z
    .array(z.string().url())
    .optional(),
});

export type CreateProductInput =
  z.infer<typeof createProductSchema>;