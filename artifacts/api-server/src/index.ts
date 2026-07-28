import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Use standard Direct Supabase DB URI or clean environment variable without conflicting SSL query parameters
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:GeekThriftsPass2026!@db.tzremfxsabivlumuezgd.supabase.co:5432/postgres";

export const pool = new Pool({
  connectionString,
  max: 1, // Crucial for Vercel serverless functions
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false, // Bypasses self-signed SSL verification on Vercel
  },
});

export const db = drizzle(pool, { schema });

export * from "./schema";