"use client";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthFromFirebase } from "@/app/hooks/useAuthFromFirebase";
import { useUserStore } from "@/store/useUserStore";
import LeftSidebar from "@/components/ui/leftSidebar";
import ProfilePageContent from "@/components/ui/profilePage";

export default function ProfilePage() {
  const setUser = useUserStore((s) => s.setUser);

  const { user: firebaseUser } = useAuthFromFirebase();
  const ensureUser = useMutation(api.users.createUser);
  const profile = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (firebaseUser) {
      ensureUser({
        username: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
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
      <LeftSidebar className="w-64" />
      <ProfilePageContent />
    </div>
  );
}