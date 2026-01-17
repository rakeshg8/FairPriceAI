// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use service role for server-side ingestion & RPC
);

console.log("Supabase env check:", {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Loaded" : "❌ Missing",
  service: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Loaded" : "❌ Missing",
});
