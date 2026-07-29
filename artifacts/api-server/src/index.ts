import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db";

const { Pool } = pg;

// Environment variable prioritize hoga, warna direct Supabase connection URL fallback ke taur par chalega
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

// Re-export all schema tables and types from @workspace/db
export * from "@workspace/db";