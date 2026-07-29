import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "geekthrifts-fallback-secret";

router.post("/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  try {
    // 1. Fetch user by email from database
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // 2. Check if the user has the 'admin' role in the database
    // (Note: ensure usersTable in @workspace/db has the role field, or cast user as any if schema isn't updated in TS yet)
    if ((user as any).role !== "admin") {
      res.status(403).json({ error: "Access denied. Admin privileges required." });
      return;
    }

    // 3. Verify password against hashed password in database
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // 4. Issue JWT Admin Token
    const token = jwt.sign(
      { id: user.id, role: "admin", email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token });
  } catch (err) {
    req.log.error({ err }, "Failed to perform admin login");
    res.status(500).json({ error: "Internal server error" });
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