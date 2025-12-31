"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import LeftSidebar from "@/components/ui/leftSidebar";
import { useColor } from "@/contexts/colorContext";
import { useRooms } from "@/contexts/roomContext";

export default function Page() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const pathname = usePathname();
  const { rooms, membersCount } = useRooms();
  const user = useUserStore((s) => s.user);
  const color = useColor().color;

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/?redirect=${pathname}`);
        return;
      }
      const { data: profile } = await supabase
        .from("Users")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (profile) {
        setUser(profile);
      }
    };
    checkAuth();
  }, [router]);

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

  return (
    <div className="text-white">
      <LeftSidebar className="w-64 gap-3" />
    </div>
  );
}
