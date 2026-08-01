import { z } from "zod";

// Re-export all generated schemas and types from Orval / OpenAPI code generator
export * from "./generated/api.js";

// Extend Category type directly to avoid cross-package dependency cycles during tsc build
export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: number | null;
  sizes?: string[];
  isActive: boolean;
  createdAt: string | Date;
};

// Size inventory item schema matching the frontend size-stock breakdown
export const SizeInventoryItemSchema = z.object({
  size: z.string(),
  qty: z.number().min(0),
});

export type SizeInventoryItem = z.infer<typeof SizeInventoryItemSchema>;

// Custom / Overridden CreateProductBody to handle multi-image, size arrays, and type fallbacks
export const CreateProductBody = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional().nullable(),
  price: z.union([z.number(), z.string()]),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  categoryId: z.union([z.number(), z.string()]),
  stock: z.union([z.number(), z.string()]).optional().default(0),
  sizes: z.array(z.string()).optional().default([]),
  widths: z.array(z.string()).optional().default([]),
  sizeInventory: z.array(SizeInventoryItemSchema).optional().default([]),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export type CreateProductBodyType = z.infer<typeof CreateProductBody>;

// Custom / Overridden UpdateProductBody
export const UpdateProductBody = CreateProductBody.partial();

export type UpdateProductBodyType = z.infer<typeof UpdateProductBody>;

// Params validator for routes taking ID
export const UpdateProductParams = z.object({
  id: z.union([z.number(), z.string()]).transform((val) => Number(val)),
});

export type UpdateProductParamsType = z.infer<typeof UpdateProductParams>;