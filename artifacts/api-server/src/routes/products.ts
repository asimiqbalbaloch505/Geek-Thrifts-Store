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
    images: Array.isArray(product.images) ? product.images : (product.imageUrl ? [product.imageUrl] : []),
    createdAt:
      product.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product.createdAt
        ? new Date(product.createdAt).toISOString()
        : new Date().toISOString(),
  };
}

// 1. GET ALL PRODUCTS
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

// 2. GET SINGLE PRODUCT BY ID
router.get("/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const [row] = await db
      .select({
        product: productsTable,
        categoryName: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id));

    if (!row) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(mapProduct(row.product, row.categoryName ?? "Uncategorized"));
  } catch (error: any) {
    req.log?.error?.({ error }, "Error fetching single product");
    res.status(500).json({
      error: "Failed to fetch product",
      message: error?.message || String(error),
    });
  }
});

// 3. CREATE PRODUCT
router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const imagesArray = Array.isArray(parsed.data.images) && parsed.data.images.length > 0
      ? parsed.data.images
      : (parsed.data.imageUrl ? [parsed.data.imageUrl] : []);

    const insertPayload = {
      ...parsed.data,
      price: String(parsed.data.price),
      imageUrl: imagesArray[0] || parsed.data.imageUrl || "",
      images: imagesArray,
      categoryId: parsed.data.categoryId ? Number(parsed.data.categoryId) : 1,
      stock: parsed.data.stock ? Number(parsed.data.stock) : 0,
      sizes: Array.isArray(parsed.data.sizes) ? parsed.data.sizes : [],
      widths: Array.isArray(parsed.data.widths) ? parsed.data.widths : [],
    };

    const [newProduct] = await db
      .insert(productsTable)
      .values(insertPayload as any)
      .returning();

    const [cat] = await db
      .select({ name: categoriesTable.name })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, newProduct.categoryId));

    res.status(201).json(mapProduct(newProduct, cat?.name ?? "Uncategorized"));
  } catch (error: any) {
    req.log?.error?.({ error }, "Error creating product");
    res.status(500).json({
      error: "Failed to create product",
      message: error?.message || String(error),
    });
  }
});

// 4. UPDATE PRODUCT
router.put("/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateProductParams.safeParse({
    id: Number(req.params.id),
  });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const updatePayload: Record<string, any> = { ...parsed.data };

    if (updatePayload.price !== undefined) {
      updatePayload.price = String(updatePayload.price);
    }
    if (updatePayload.categoryId !== undefined) {
      updatePayload.categoryId = Number(updatePayload.categoryId);
    }
    if (updatePayload.stock !== undefined) {
      updatePayload.stock = Number(updatePayload.stock);
    }
    if (Array.isArray(updatePayload.images) && updatePayload.images.length > 0) {
      updatePayload.imageUrl = updatePayload.images[0];
    }

    const [updated] = await db
      .update(productsTable)
      .set(updatePayload)
      .where(eq(productsTable.id, paramsParsed.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const [cat] = await db
      .select({ name: categoriesTable.name })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, updated.categoryId));

    res.json(mapProduct(updated, cat?.name ?? "Uncategorized"));
  } catch (error: any) {
    req.log?.error?.({ error }, "Error updating product");
    res.status(500).json({
      error: "Failed to update product",
      message: error?.message || String(error),
    });
  }
});

// 5. DELETE PRODUCT
router.delete("/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  try {
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    req.log?.error?.({ error }, "Error deleting product");
    res.status(500).json({
      error: "Failed to delete product",
      message: error?.message || String(error),
    });
  }
});

export default router;