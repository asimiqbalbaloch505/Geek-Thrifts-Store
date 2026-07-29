import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Environment variable prioritize hoga, warna direct Supabase connection URL fallback ke taur par chalega
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:GeekThriftsPass2026!@db.tzremfxsabivlumuezgd.supabase.co:5432/postgres";

export const pool = new Pool({
  connectionString,
  max: 1, // Vercel serverless functions ke liye best connection limit
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false, // Vercel ke serverless environment mein SSL crash hone se bachata hai
  },
});

export const db = drizzle(pool, { schema });

export * from "./schema";