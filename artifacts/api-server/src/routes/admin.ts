import { Router, Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "geekthrifts-fallback-secret";

interface AdminJwtPayload {
  id: number;
  email: string;
  role: string;
  name?: string;
}

/**
 * Middleware: Verifies that the request contains a valid JWT token
 * and that the token payload explicitly has role: "admin"
 */
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || (req.headers.Authorization as string);

  if (!authHeader?.startsWith("Bearer ")) {
    (req as any).log?.warn?.("Admin Auth Failed: Missing or malformed Bearer token");
    res.status(401).json({ error: "Unauthorized access: Missing token" });
    return;
  }

  const token = authHeader.slice(7).trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;

    if (payload.role !== "admin") {
      (req as any).log?.warn?.(
        { userId: payload.id, role: payload.role },
        "Admin Auth Failed: User lacks admin role"
      );
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    // Attach user payload to request for downstream handlers
    (req as any).user = payload;
    next();
  } catch (err) {
    (req as any).log?.warn?.({ err }, "Admin Auth Failed: Invalid or expired token");
    res.status(401).json({ error: "Invalid or expired session token" });
    return;
  }
}

// -----------------------------------------------------------------------------
// POST /login - Admin Login Endpoint
// -----------------------------------------------------------------------------
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Safe Parameterized DB Query (SQL Injection Protected)
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, cleanEmail))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // 2. Role Check from Database
    if (user.role !== "admin") {
      res.status(403).json({ error: "Access denied. Admin privileges required." });
      return;
    }

    // 3. Constant-Time Bcrypt Comparison
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // 4. Issue Admin JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token });
  } catch (err) {
    (req as any).log?.error?.({ err }, "Failed to perform admin login");
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------------------------------
// GET /stats - Fetch Store Statistics
// -----------------------------------------------------------------------------
router.get("/stats", requireAdmin, async (req: Request, res: Response): Promise<void> => {
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
    (req as any).log?.error?.({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;