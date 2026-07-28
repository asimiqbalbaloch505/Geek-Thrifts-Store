import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.tzremfxsabivlumuezgd:GeekThriftsPass2026%21@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=verify-full";

export const pool = new Pool({
  connectionString,
  max: 1, // Crucial for Vercel serverless functions
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false, // Prevents SSL certificate validation crashes in Vercel
  },
});

export const db = drizzle(pool, { schema });

export * from "./schema";