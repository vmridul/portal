"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const saveUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("Users").upsert({
        user_id: user.id,
        avatar: user.user_metadata?.avatar_url || "",
        username: user.user_metadata?.name || user.email?.split("@")[0],
      });
    };
    saveUser();
  }, [router]);

  return <div className="text-white"></div>;
}
