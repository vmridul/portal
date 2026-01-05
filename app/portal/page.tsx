"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import LeftSidebar from "@/components/ui/leftSidebar";
import FriendsTab from "@/components/friendsTab";
import NotificationTab from "@/components/notificationTab";

export default function Page() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const saveUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("Users")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setUser(data);
        return;
      } else {
        const { data, error } = await supabase
          .from("Users")
          .insert({
            user_id: user.id,
            avatar: user.user_metadata?.avatar_url || "",
            username: user.user_metadata?.name || user.email?.split("@")[0],
          })
          .select()
          .single();
        if (error) throw error;
        if (data) setUser(data);
      }
    };
    saveUser();
  }, [router]);

  return (
    <div className="text-white flex">
      <LeftSidebar className="w-64" />
      <FriendsTab />
      <NotificationTab />
    </div>
  );
}
