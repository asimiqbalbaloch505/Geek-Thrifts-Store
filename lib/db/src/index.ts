import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// URL-encoded password for special characters (GeekThriftsPass2026! -> GeekThriftsPass2026%21)
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.tzremfxsabivlumuezgd:GeekThriftsPass2026%21@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require";

export const pool = new Pool({
  connectionString,
  max: 1, // Crucial for Vercel serverless: 1 connection per instance to avoid socket exhaustion
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });

export * from "./schema";