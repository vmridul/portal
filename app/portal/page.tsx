"use client";
import { useEffect } from "react";
import { useAuthFromFirebase } from "@/hooks/useAuthFromFirebase";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import LeftSidebar from "@/components/layout/LeftSidebar";
import FriendsTab from "@/components/features/friends/FriendsTab";
import NotificationTab from "@/components/features/notifications/NotificationTab";
import { useCurrentUser, useUserProfileActions } from "@/hooks";

export default function Page() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  const { user: firebaseUser } = useAuthFromFirebase();
  const { createUser } = useUserProfileActions();
  const { user: profile } = useCurrentUser();

  useEffect(() => {
    if (firebaseUser) {
      createUser({
        username: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
        avatar: firebaseUser.photoURL || "",
      });
    }
  }, [firebaseUser, createUser]);

  useEffect(() => {
    if (profile) {
      setUser(profile);
    }
  }, [profile, setUser]);

  return (
    <div className="text-white flex">
      <LeftSidebar className="w-64" />
      <FriendsTab />
      <NotificationTab />
    </div>
  );
}
