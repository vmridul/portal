import { createClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { capacitorStorage } from "./capacitorStorage";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: Capacitor.isNativePlatform() ? capacitorStorage : undefined,
    },
  }
);
