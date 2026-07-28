import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.tzremfxsabivlumuezgd:GeekThriftsPass2026!@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=verify-full";

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Critical for Supabase pooler inside Vercel serverless functions
  },
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

export * from "./schema";