"use client";
import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthFromFirebase } from "@/app/hooks/useAuthFromFirebase";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import {
  Moon,
  Circle,
  Pencil,
  Copy,
  ArrowLeft,
  Users,
  Clock,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { formatToIST } from "@/app/actions/formatToIST";
import { useColor } from "@/contexts/colorContext";
import { usePresence } from "@/contexts/presenceContext";
import { useRouter } from "next/navigation";

export default function ProfilePageContent() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);
  const { color, textColor } = useColor();
  const { awayUsers, setStatus } = usePresence();

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

  const [presenceMenu, setPresenceMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [isUploading, setIsUploading] = useState(false);

  const changeNameMutation = useMutation(api.users.changeName);
  const changeAvatarMutation = useMutation(api.users.changeAvatar);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const getUrl = useMutation(api.storage.getUrlMutation);

  useEffect(() => {
    setNewUsername(user?.username || "");
  }, [user?.user_id]);

  const onChangeName = async () => {
    if (!newUsername || newUsername === user?.username) return;
    try {
      await changeNameMutation({ username: newUsername });
      setUser({ ...user!, username: newUsername });
      toast.success("Name updated successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to change name");
    }
  };

  const onChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      const newAvatarUrl = await getUrl({ storageId });

      if (newAvatarUrl) {
        await changeAvatarMutation({ avatarUrl: newAvatarUrl });
        setUser({ ...user!, avatar: newAvatarUrl });
        toast.success("Avatar updated successfully");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to change avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const isAway = user?.user_id && awayUsers.has(user?.user_id.toString());

  return (
    <div className="w-full">
      <div className="flex justify-between w-full md:px-2 px-7 items-center bg-theme-base border-b border-theme-border py-1 md:py-3">
        <div className="ml-3 md:flex hidden items-center gap-2 text-white/90">
          <User className="w-4 h-4" />
          <h1 className="text-md">Profile</h1>
        </div>
        <div className="ml-3 md:hidden flex items-center gap-2 text-white/90">
          <h1 className="text-md font-semibold mt-1">Portal</h1>
        </div>
        <div className="flex items-center text-sm gap-1"></div>
      </div>
    </div>
  );
}
