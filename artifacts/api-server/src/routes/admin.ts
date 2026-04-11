import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "geekthrifts2024";

router.post("/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password } = parsed.data;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString("hex");
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.get("/stats", async (req, res): Promise<void> => {
  try {
    const ordersResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        COALESCE(SUM(CAST(total_amount AS DECIMAL)) FILTER (WHERE status = 'delivered'), 0) as total_revenue
      FROM orders
    `);

    const productsResult = await db.execute(sql`SELECT COUNT(*) as count FROM products WHERE is_active = true`);
    const categoriesResult = await db.execute(sql`SELECT COUNT(*) as count FROM categories WHERE is_active = true`);

    const stats = ordersResult.rows[0] as {
      total_orders: string;
      pending_orders: string;
      confirmed_orders: string;
      delivered_orders: string;
      cancelled_orders: string;
      total_revenue: string;
    };

    res.json({
      totalOrders: Number(stats.total_orders),
      pendingOrders: Number(stats.pending_orders),
      confirmedOrders: Number(stats.confirmed_orders),
      deliveredOrders: Number(stats.delivered_orders),
      cancelledOrders: Number(stats.cancelled_orders),
      totalRevenue: Number(stats.total_revenue),
      totalProducts: Number((productsResult.rows[0] as { count: string }).count),
      totalCategories: Number((categoriesResult.rows[0] as { count: string }).count),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
