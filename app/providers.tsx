"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        supabase.auth.getSession();
    }, []);

    return <>{children}</>;
}
