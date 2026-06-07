
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase";

const supa_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supa_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supa_url || !supa_key) {
  throw new Error("Missing Supabase env vars in .env file");
}

export const SupaClient = createClient<Database>(supa_url, supa_key);
