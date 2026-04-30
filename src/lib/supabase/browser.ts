import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Fallback placeholders allow the module to load during build;
// real values must be set in .env.local before deployment.
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
);
