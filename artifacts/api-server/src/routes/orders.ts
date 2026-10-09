import { Router } from "express";

const router = Router();
import { db } from "@workspace/db";
import { ordersTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateOrderBody,
  ListOrdersQueryParams,
  GetOrderParams,
} from "@workspace/api-zod";
import { sendOrderConfirmationEmails, sendStatusUpdateEmails } from "../lib/email.js";

function mapOrder(order: typeof ordersTable.$inferSelect) {
  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt.toISOString(),
    items: order.items as Array<{ productId: number; productName: string; quantity: number; size: string; price: number }>,
  };
}

// 1. GET ALL ORDERS
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

// 2. CREATE ORDER (Deducts stock and size inventory)
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

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient overall stock for ${product.name}`);
        }

        return {
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          size: item.size,
          price: Number(product.price),
          currentProduct: product,
        };
      })
    );

    const totalAmount = itemsWithDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail ?? null,
        customerPhone: parsed.data.customerPhone,
        customerAddress: parsed.data.customerAddress,
        customerCity: parsed.data.customerCity,
        notes: parsed.data.notes ?? null,
        status: "pending",
        totalAmount: String(totalAmount),
        items: itemsWithDetails.map(({ currentProduct, ...item }) => item),
      })
      .returning();

    // Deduct stock and size-specific inventory
    await Promise.all(
      itemsWithDetails.map(async (item) => {
        const product = item.currentProduct;
        const newStock = Math.max(0, product.stock - item.quantity);

        let rawInv = (product as any).sizeInventory ?? (product as any).size_inventory;
        if (typeof rawInv === "string") {
          try { rawInv = JSON.parse(rawInv); } catch { rawInv = null; }
        }

        let updatedInv = rawInv;

        if (Array.isArray(rawInv)) {
          updatedInv = rawInv.map((s: any) => {
            const sizeName = String(s.size ?? s.label ?? "").trim();
            const targetSize = String(item.size).trim();
            if (sizeName.toLowerCase() === targetSize.toLowerCase()) {
              const currentQty = Number(s.qty ?? s.quantity ?? 0);
              return { ...s, qty: Math.max(0, currentQty - item.quantity) };
            }
            return s;
          });
        } else if (rawInv && typeof rawInv === "object") {
          updatedInv = { ...rawInv };
          const targetSize = String(item.size).trim();
          const foundKey = Object.keys(updatedInv).find(k => k.trim().toLowerCase() === targetSize.toLowerCase());
          if (foundKey) {
            const currentQty = Number(updatedInv[foundKey] ?? 0);
            updatedInv[foundKey] = Math.max(0, currentQty - item.quantity);
          }
        }

        await db
          .update(productsTable)
          .set({
            stock: newStock,
            sizeInventory: updatedInv,
          })
          .where(eq(productsTable.id, item.productId));
      })
    );

    res.status(201).json(mapOrder(order));

    sendOrderConfirmationEmails({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      customerCity: order.customerCity,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      items: itemsWithDetails,
    }).catch((err) => req.log.error({ err }, "Failed to send order confirmation emails"));
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: (err as Error).message || "Internal server error" });
  }
});

// 3. GET SINGLE ORDER BY ID
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

// 4. SHARED UPDATE ORDER HANDLER (Status Change, Inventory Sync & Archiving)
async function handleUpdateOrder(req: any, res: any): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  try {
    const [existingOrder] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1);

    if (!existingOrder) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const updateData: Record<string, any> = {};

    if (req.body.isArchived !== undefined) {
      updateData.isArchived = Boolean(req.body.isArchived);
    }

    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
    }

    const previousStatus = String(existingOrder.status ?? "").trim().toLowerCase();
    const newStatus = String(req.body.status ?? previousStatus).trim().toLowerCase();

    // Perform DB update
    const [updated] = await db
      .update(ordersTable)
      .set(updateData)
      .where(eq(ordersTable.id, id))
      .returning();

    const items = existingOrder.items as Array<{ productId: number; quantity: number; size: string }>;

    // RESTORE INVENTORY when transitioning to "cancelled"
    if (previousStatus !== "cancelled" && newStatus === "cancelled") {
      await Promise.all(
        items.map(async (item) => {
          const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
          if (!product) return;

          const restoredStock = Number(product.stock ?? 0) + Number(item.quantity ?? 0);

          let rawInv = (product as any).sizeInventory ?? (product as any).size_inventory;
          if (typeof rawInv === "string") {
            try { rawInv = JSON.parse(rawInv); } catch { rawInv = null; }
          }

          let updatedInv = rawInv;

          if (Array.isArray(rawInv)) {
            updatedInv = rawInv.map((s: any) => {
              const sizeName = String(s.size ?? s.label ?? "").trim();
              const targetSize = String(item.size).trim();
              if (sizeName.toLowerCase() === targetSize.toLowerCase()) {
                const currentQty = Number(s.qty ?? s.quantity ?? 0);
                return { ...s, qty: currentQty + Number(item.quantity ?? 0) };
              }
              return s;
            });
          } else if (rawInv && typeof rawInv === "object") {
            updatedInv = { ...rawInv };
            const targetSize = String(item.size).trim();
            const foundKey = Object.keys(updatedInv).find(k => k.trim().toLowerCase() === targetSize.toLowerCase());
            if (foundKey) {
              const currentQty = Number(updatedInv[foundKey] ?? 0);
              updatedInv[foundKey] = currentQty + Number(item.quantity ?? 0);
            }
          }

          await db
            .update(productsTable)
            .set({
              stock: restoredStock,
              sizeInventory: updatedInv,
            })
            .where(eq(productsTable.id, item.productId));
        })
      );
    } 
    // RE-DEDUCT INVENTORY on reactivation
    else if (previousStatus === "cancelled" && newStatus !== "cancelled") {
      await Promise.all(
        items.map(async (item) => {
          const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
          if (!product) return;

          const newStock = Math.max(0, Number(product.stock ?? 0) - Number(item.quantity ?? 0));

          let rawInv = (product as any).sizeInventory ?? (product as any).size_inventory;
          if (typeof rawInv === "string") {
            try { rawInv = JSON.parse(rawInv); } catch { rawInv = null; }
          }

          let updatedInv = rawInv;

          if (Array.isArray(rawInv)) {
            updatedInv = rawInv.map((s: any) => {
              const sizeName = String(s.size ?? s.label ?? "").trim();
              const targetSize = String(item.size).trim();
              if (sizeName.toLowerCase() === targetSize.toLowerCase()) {
                const currentQty = Number(s.qty ?? s.quantity ?? 0);
                return { ...s, qty: Math.max(0, currentQty - Number(item.quantity ?? 0)) };
              }
              return s;
            });
          } else if (rawInv && typeof rawInv === "object") {
            updatedInv = { ...rawInv };
            const targetSize = String(item.size).trim();
            const foundKey = Object.keys(updatedInv).find(k => k.trim().toLowerCase() === targetSize.toLowerCase());
            if (foundKey) {
              const currentQty = Number(updatedInv[foundKey] ?? 0);
              updatedInv[foundKey] = Math.max(0, currentQty - Number(item.quantity ?? 0));
            }
          }

          await db
            .update(productsTable)
            .set({
              stock: newStock,
              sizeInventory: updatedInv,
            })
            .where(eq(productsTable.id, item.productId));
        })
      );
    }

    res.json(mapOrder(updated));

    if (req.body.status) {
      sendStatusUpdateEmails({
        id: updated.id,
        customerName: updated.customerName,
        customerEmail: updated.customerEmail,
        customerPhone: updated.customerPhone,
        customerAddress: updated.customerAddress,
        customerCity: updated.customerCity,
        totalAmount: Number(updated.totalAmount),
        status: updated.status,
        items: updated.items as Array<{ productName: string; quantity: number; size: string; price: number }>,
      }).catch((err) => req.log.error({ err }, "Failed to send status update emails"));
    }
  } catch (err) {
    req.log.error({ err }, "Failed to update order");
    res.status(500).json({ error: "Internal server error" });
  }
}

// Bind handleUpdateOrder to both PUT and POST methods
router.put("/:id", handleUpdateOrder);
router.post("/:id", handleUpdateOrder);

export default router;