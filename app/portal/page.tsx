"use client";
import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import LeftSidebar from "@/components/layout/LeftSidebar";
import FriendsTab from "@/components/features/friends/FriendsTab";
import NotificationTab from "@/components/features/notifications/NotificationTab";
import { useCurrentUser } from "@/hooks";

export default function Page() {
  const setUser = useUserStore((s) => s.setUser);
  const { user: profile } = useCurrentUser();

  useEffect(() => {
    if (profile) {
      setUser(profile);
    }
  }, [profile, setUser]);

  return (
    <div className="flex h-[100dvh] overflow-hidden text-white">
      <LeftSidebar className="w-64" />
      <FriendsTab />
      <NotificationTab />
    </div>
  );
}
