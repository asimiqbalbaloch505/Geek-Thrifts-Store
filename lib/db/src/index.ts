import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:GeekThriftsPass2026!@db.tzremfxsabivlumuezgd.supabase.co:5432/postgres";

export const pool = new Pool({
  connectionString,
  max: 1, // Optimal connection limit for Vercel serverless functions
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });

// Export all database tables, relations, schemas, and types
export * from "./schema/index.js";