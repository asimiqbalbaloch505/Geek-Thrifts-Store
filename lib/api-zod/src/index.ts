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