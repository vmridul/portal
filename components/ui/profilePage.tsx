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
  X,
  CircleUser,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { formatToIST } from "@/app/actions/formatToIST";
import { useColor } from "@/contexts/colorContext";
import { usePresence } from "@/contexts/presenceContext";
import { useRouter } from "next/navigation";
import { UserInfoTab } from "./userInfoTab";
import { PreferencesTab } from "./preferencesTab";

export default function ProfilePageContent() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);
  const { color, textColor } = useColor();
  const { awayUsers, setStatus } = usePresence();
  const [currentTab, setCurrentTab] = useState("Info");

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
      {/* Header */}
      <div className="flex justify-between w-full md:px-2 px-7 items-center bg-theme-base border-b border-theme-border py-1 h-12">
        <div className="ml-3 flex items-center w-full justify-between text-white/90">
          <div className="flex gap-2 items-center">
            <User className="w-4 h-4" />
            <h1 className="text-md">Profile</h1>
          </div>
          <X
            onClick={() => {
              router.back();
            }}
            className="w-6 h-6 md:mr-2 hover:bg-theme-base cursor-pointer duration-100 transition-all ease-in-out rounded-[8px] p-1 text-white/70"
          />
        </div>
      </div>

      <div className="flex md:flex-row flex-col">
        {/* Sidebar */}
        <div className="md:flex hidden w-[22%] h-screen bg-theme-base border-r border-theme-border p-3 flex-col gap-2">
          <button
            onClick={() => setCurrentTab("Info")}
            className={`flex text-sm items-center ${currentTab == "Info" ? "bg-theme-hover" : "bg-theme-base"} hover:bg-theme-hover gap-1 px-3 py-2 rounded-[8px]`}
          >
            <CircleUser className="w-4 h-4" />
            <span>User Info</span>
          </button>
          <button
            onClick={() => setCurrentTab("Preferences")}
            className={`flex text-sm items-center ${currentTab == "Preferences" ? "bg-theme-hover" : "bg-theme-base"} hover:bg-theme-hover gap-1 px-3 py-2 rounded-[8px]`}
          >
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="flex items-center md:hidden p-2 gap-1">
          <button
            onClick={() => setCurrentTab("Info")}
            className={`flex text-sm items-center ${currentTab == "Info" ? "bg-theme-hover" : "bg-theme-base"} gap-1 px-3 py-1 rounded-[8px]`}
          >
            <CircleUser className="w-4 h-4" />
            <span>User Info</span>
          </button>
          <button
            onClick={() => setCurrentTab("Preferences")}
            className={`flex text-sm items-center ${currentTab == "Preferences" ? "bg-theme-hover" : "bg-theme-base"} gap-1 px-3 py-1 rounded-[8px]`}
          >
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </div>
        <div className="w-full overflow-y-auto h-screen">
          {currentTab === "Info" && <UserInfoTab />}
          {currentTab === "Preferences" && <PreferencesTab />}
        </div>
      </div>
    </div>
  );
}
