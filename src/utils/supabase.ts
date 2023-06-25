
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase";



NEXT_PUBLIC_SUPABASE_URL='https://mhrttdcgoqsdswpocase.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocnR0ZGNnb3FzZHN3cG9jYXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc3MTIxOTksImV4cCI6MjAwMzI4ODE5OX0.WUEGFzJViFwqDD-kFdZdy1moSI3wpUUVAoa5C5L6_Bk"

export const SupaClient = createClient<Database>(supa_url,supa_key);
