router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Explicit validation to ensure image URL exists
  if (!parsed.data.imageUrl || parsed.data.imageUrl.trim() === "") {
    res.status(400).json({ error: "Product image URL is required" });
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

  // Explicit validation to ensure image URL exists on update
  if (parsed.data.imageUrl !== undefined && parsed.data.imageUrl.trim() === "") {
    res.status(400).json({ error: "Product image URL cannot be empty" });
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