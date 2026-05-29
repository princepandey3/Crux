import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log(
  "KEY starts with:",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20),
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { realtime: { transport: ws } },
);

const { data, error } = await supabase
  .from("interview_sessions")
  .select("id")
  .limit(1);

if (error) {
  console.error("❌ Supabase error:", error.message, error.code);
} else {
  console.log("✅ Connected! Rows returned:", data.length);
}
