import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
} from "@workspace/api-zod";

const router = Router();

function mapProduct(product: any, categoryName: string) {
  return {
    ...product,
    price: Number(product.price ?? 0),
    categoryName,
    createdAt:
      product.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product.createdAt
        ? new Date(product.createdAt).toISOString()
        : new Date().toISOString(),
  };
}

router.get("/", async (req, res): Promise<void> => {
  try {
    const productsList = await db
      .select({
        product: productsTable,
        categoryName: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id));

    const formattedProducts = productsList.map(({ product, categoryName }) =>
      mapProduct(product, categoryName ?? "Uncategorized")
    );

    res.json(formattedProducts);
  } catch (error: any) {
    req.log?.error?.({ error }, "Error fetching products");
    
    res.status(500).json({ 
      error: "Failed to fetch products",
      message: error?.message || String(error),
      code: error?.code
    });
  }
});

export default router;