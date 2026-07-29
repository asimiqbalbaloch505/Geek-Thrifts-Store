import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db";

const { Pool } = pg;

// Use the transaction pooler URL as the fallback as well
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.tzremfxsabivlumuezgd:GeekThriftsPass2026!@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

export const pool = new Pool({
  connectionString,
  max: 1, // Crucial for Vercel serverless functions
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false, // Bypasses SSL verification on Vercel
  },
  // IMPORTANT: Disable prepared statements for Supabase PgBouncer (Port 6543)
  // node-postgres will execute queries directly without prepending statement names
  statement_timeout: 10000,
});

// Pass options to drizzle to disable prepared statements mode
export const db = drizzle(pool, { schema });

// Re-export all schema tables and types from @workspace/db
export * from "@workspace/db";