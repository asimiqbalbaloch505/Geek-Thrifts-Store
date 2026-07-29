import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  DeleteCategoryParams,
  UpdateCategoryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const categoriesWithCounts = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
        imageUrl: categoriesTable.imageUrl,
        parentId: categoriesTable.parentId,
        sizes: categoriesTable.sizes,
        isActive: categoriesTable.isActive, // ✅ ADDED: Select isActive
        createdAt: categoriesTable.createdAt,
        productCount: sql<number>`CAST(COUNT(CASE WHEN ${productsTable.isActive} = true THEN 1 END) AS INTEGER)`,
      })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(categoriesTable.id, productsTable.categoryId))
      .groupBy(
        categoriesTable.id,
        categoriesTable.name,
        categoriesTable.slug,
        categoriesTable.description,
        categoriesTable.imageUrl,
        categoriesTable.parentId,
        categoriesTable.sizes,
        categoriesTable.isActive, // ✅ ADDED: Include isActive in GroupBy
        categoriesTable.createdAt
      )
      .orderBy(categoriesTable.name);

    const formatted = categoriesWithCounts.map((cat) => ({
      ...cat,
      createdAt: cat.createdAt?.toISOString?.() ?? cat.createdAt,
    }));

    res.json(formatted);
  } catch (err: any) {
    req.log?.error?.({ err }, "Failed to list categories");

    res.status(500).json({
      error: "Internal server error",
      message: err?.message || String(err),
      code: err?.code,
      detail: err?.detail,
    });
  }
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    // Generate a fallback slug if missing or empty
    const slug =
      parsed.data.slug && parsed.data.slug.trim() !== ""
        ? parsed.data.slug.trim().toLowerCase().replace(/\s+/g, "-")
        : parsed.data.name.trim().toLowerCase().replace(/\s+/g, "-");

    // Strictly construct the database insert object (prevents extra payload fields from breaking Postgres)
    const insertData = {
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      imageUrl: (parsed.data as any).imageUrl ?? null,
      parentId:
        req.body.parentId !== undefined && req.body.parentId !== null
          ? Number(req.body.parentId) || null
          : null,
      sizes: Array.isArray(req.body.sizes)
        ? req.body.sizes
        : (parsed.data as any).sizes ?? [],
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
    };

    const [category] = await db
      .insert(categoriesTable)
      .values(insertData)
      .returning();

    res.status(201).json({
      ...category,
      productCount: 0,
      createdAt: category.createdAt?.toISOString?.() ?? category.createdAt,
    });
  } catch (err: any) {
    req.log?.error?.({ err }, "Failed to create category");
    res.status(500).json({
      error: "Failed to create category",
      message: err?.message || String(err),
      detail: err?.detail,
    });
  }
});

router.put("/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateCategoryParams.safeParse({
    id: Number(req.params.id),
  });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const updatePayload: Record<string, any> = { ...parsed.data };

    if ("parentId" in req.body) {
      updatePayload.parentId = req.body.parentId
        ? Number(req.body.parentId)
        : null;
    }

    if ("sizes" in req.body) {
      updatePayload.sizes = Array.isArray(req.body.sizes)
        ? req.body.sizes
        : [];
    }

    if ("isActive" in req.body) {
      updatePayload.isActive = Boolean(req.body.isActive); // ✅ Supports toggling active status in PUT endpoint
    }

    const [updated] = await db
      .update(categoriesTable)
      .set(updatePayload)
      .where(eq(categoriesTable.id, paramsParsed.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const [countRow] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(productsTable)
      .where(
        sql`${productsTable.categoryId} = ${updated.id} AND ${productsTable.isActive} = true`
      );

    res.json({
      ...updated,
      productCount: countRow?.count ?? 0,
      createdAt: updated.createdAt?.toISOString?.() ?? updated.createdAt,
    });
  } catch (err: any) {
    req.log?.error?.({ err }, "Failed to update category");
    res.status(500).json({
      error: "Failed to update category",
      message: err?.message || String(err),
    });
  }
});

router.delete("/:id", async (req, res): Promise<void> => {
  const paramsParsed = DeleteCategoryParams.safeParse({
    id: Number(req.params.id),
  });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, paramsParsed.data.id));
    res.json({ success: true, message: "Category deleted" });
  } catch (err: any) {
    req.log?.error?.({ err }, "Failed to delete category");
    res.status(500).json({
      error: "Failed to delete category",
      message: err?.message || String(err),
    });
  }
});

export default router;