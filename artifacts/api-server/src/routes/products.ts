import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike } from "drizzle-orm";
import {
  CreateProductBody,
  UpdateProductBody,
  ListProductsQueryParams,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

function mapProduct(product: typeof productsTable.$inferSelect, categoryName: string) {
  const sizeInventory = (product.sizeInventory ?? []) as Array<{ size: string; qty: number }>;
  const totalStock = sizeInventory.length > 0
    ? sizeInventory.reduce((sum, s) => sum + s.qty, 0)
    : product.stock;

  const createdAtString = product.createdAt 
    ? new Date(product.createdAt).toISOString() 
    : new Date().toISOString();

  return {
    ...product,
    price: Number(product.price),
    categoryName,
    subcategory: product.subcategory ?? null,
    sizes: product.sizes ?? [],
    sizeInventory,
    stock: totalStock,
    createdAt: createdAtString,
  };
}

router.get("/", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const conditions = [eq(productsTable.isActive, true)];
    if (parsed.data.categoryId) {
      conditions.push(eq(productsTable.categoryId, parsed.data.categoryId));
    }
    if (parsed.data.search) {
      conditions.push(ilike(productsTable.name, `%${parsed.data.search}%`));
    }

    const products = await db
      .select({
        product: productsTable,
        categoryName: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(...conditions))
      .orderBy(productsTable.createdAt);

    res.json(products.map(({ product, categoryName }) => mapProduct(product, categoryName ?? "Unknown")));
  } catch (err: any) {
    req.log?.error?.({ err }, "Failed to list products");
    res.status(500).json({ 
      error: "Internal server error", 
      details: err?.message || String(err) 
    });
  }
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [product] = await db
      .insert(productsTable)
      .values({ ...parsed.data, price: String(parsed.data.price) })
      .returning();
    const category = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1);
    res.status(201).json(mapProduct(product, category[0]?.name ?? "Unknown"));
  } catch (err) {
    req.log?.error?.({ err }, "Failed to create product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  const paramsParsed = GetProductParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [row] = await db
      .select({ product: productsTable, categoryName: categoriesTable.name })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, paramsParsed.data.id))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(mapProduct(row.product, row.categoryName ?? "Unknown"));
  } catch (err) {
    req.log?.error?.({ err }, "Failed to get product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateProductParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [updated] = await db
      .update(productsTable)
      .set({ ...parsed.data, price: String(parsed.data.price) })
      .where(eq(productsTable.id, paramsParsed.data.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const category = await db.select().from(categoriesTable).where(eq(categoriesTable.id, updated.categoryId)).limit(1);
    res.json(mapProduct(updated, category[0]?.name ?? "Unknown"));
  } catch (err) {
    req.log?.error?.({ err }, "Failed to update product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res): Promise<void> => {
  const paramsParsed = DeleteProductParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(productsTable).where(eq(productsTable.id, paramsParsed.data.id));
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to delete product");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;