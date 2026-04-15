"use client";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthFromFirebase } from "@/app/hooks/useAuthFromFirebase";
import { useUserStore } from "@/store/useUserStore";
import LeftSidebar from "@/components/layout/LeftSidebar";
import ProfilePage from "@/components/features/profile/ProfilePage";

export default function Page() {
  const setUser = useUserStore((s) => s.setUser);

  const { user: firebaseUser } = useAuthFromFirebase();
  const ensureUser = useMutation(api.users.createUser);
  const profile = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (firebaseUser) {
      ensureUser({
        username:
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "User",
        avatar: firebaseUser.photoURL || "",
      });
    }
  }, [firebaseUser, ensureUser]);

  useEffect(() => {
    if (profile) {
      setUser(profile);
    }
  }, [profile, setUser]);

  return (
    <div className="text-white flex">
      <LeftSidebar className="w-64" showPortalSkeletons={false} />
      <ProfilePage />
    </div>
  );
}
