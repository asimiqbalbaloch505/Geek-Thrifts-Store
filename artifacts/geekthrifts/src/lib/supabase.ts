import { createClient } from "@supabase/supabase-js";

// Uses Vercel environment variables if present, otherwise defaults directly to your Supabase project
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://tzremfxsabivlumuezgd.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6cmVtZnhzYWJpdmx1bXVlemdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NzE0MzUsImV4cCI6MjA5ODM0NzQzNX0.4MXAQ5ZeWWjCP9IV4nubMFDY1Xj72jtoCskwqdghHJ4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);