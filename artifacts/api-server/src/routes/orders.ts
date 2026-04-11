import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateOrderBody,
  UpdateOrderStatusBody,
  ListOrdersQueryParams,
  GetOrderParams,
  UpdateOrderStatusParams,
} from "@workspace/api-zod";

const router = Router();

function mapOrder(order: typeof ordersTable.$inferSelect) {
  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt.toISOString(),
    items: order.items as Array<{ productId: number; productName: string; quantity: number; size: string; price: number }>,
  };
}

router.get("/", async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    let query = db.select().from(ordersTable).$dynamic();
    if (parsed.data.status) {
      query = query.where(eq(ordersTable.status, parsed.data.status));
    }
    const orders = await query.orderBy(ordersTable.createdAt);
    res.json(orders.map(mapOrder));
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const itemsWithDetails = await Promise.all(
      parsed.data.items.map(async (item) => {
        const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        return {
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          size: item.size,
          price: Number(product.price),
        };
      })
    );

    const totalAmount = itemsWithDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerAddress: parsed.data.customerAddress,
        customerCity: parsed.data.customerCity,
        notes: parsed.data.notes ?? null,
        status: "pending",
        totalAmount: String(totalAmount),
        items: itemsWithDetails,
      })
      .returning();

    res.status(201).json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  const paramsParsed = GetOrderParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, paramsParsed.data.id)).limit(1);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateOrderStatusParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [updated] = await db
      .update(ordersTable)
      .set({ status: parsed.data.status })
      .where(eq(ordersTable.id, paramsParsed.data.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(mapOrder(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
