import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// 1. Check process.env, Fallback directly to your Supabase Transaction Pooler connection string
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.tzremfxsabivlumuezgd:GeekThriftsPass2026!@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require";

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Supabase serverless connections
});

export const db = drizzle(pool, { schema });

export * from "./schema";