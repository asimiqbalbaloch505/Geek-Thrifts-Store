import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
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
    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const countResult = await db.execute(
          sql`SELECT COUNT(*) as count FROM products WHERE category_id = ${cat.id} AND is_active = true`
        );
        const count = Number((countResult.rows[0] as { count: string }).count);
        return {
          ...cat,
          productCount: count,
          createdAt: cat.createdAt.toISOString(),
        };
      })
    );
    res.json(withCounts);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  try {
    // Manually ensure parentId is explicitly passed if present in req.body
    const insertData = {
      ...parsed.data,
      parentId: req.body.parentId !== undefined ? (req.body.parentId ? Number(req.body.parentId) : null) : null,
    };

    const [category] = await db.insert(categoriesTable).values(insertData).returning();
    res.status(201).json({ ...category, productCount: 0, createdAt: category.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateCategoryParams.safeParse({ id: Number(req.params.id) });
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
    // Explicitly grab parentId from req.body so Zod schema stripping doesn't lose it
    const updatePayload: Record<string, any> = { ...parsed.data };
    
    if ("parentId" in req.body) {
      updatePayload.parentId = req.body.parentId ? Number(req.body.parentId) : null;
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
    const countResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM products WHERE category_id = ${updated.id} AND is_active = true`
    );
    const count = Number((countResult.rows[0] as { count: string }).count);
    res.json({ ...updated, productCount: count, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res): Promise<void> => {
  const paramsParsed = DeleteCategoryParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, paramsParsed.data.id));
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete category");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;