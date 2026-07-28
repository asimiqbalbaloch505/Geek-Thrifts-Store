import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
} from "@workspace/api-zod";

// ⚠️ THIS WAS MISSING:
const router = Router();

// Helper function mapProduct (ensure it exists in your file)
function mapProduct(product: any, categoryName: string) {
  return {
    ...product,
    price: Number(product.price),
    categoryName,
    createdAt: product.createdAt.toISOString(),
  };
}

router.post("/", async (req, res): Promise<void> => {
  // ... rest of your route code ...
});

router.put("/:id", async (req, res): Promise<void> => {
  // ... rest of your route code ...
});

export default router;