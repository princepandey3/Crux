import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase environment variables.\n" +
      "Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    transport: ws, // ← fixes Node 20 WebSocket issue
  },
});

export default supabase;
