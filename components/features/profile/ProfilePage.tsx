"use client";
import { useState } from "react";
import { User, UserCircle, Gear, X, GearSixIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { UserInfoTab } from "./UserInfoTab";
import { PreferencesTab } from "./PreferencesTab";

export default function ProfilePage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("Info");

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between w-full md:px-2 px-7 items-center bg-theme-surface border-b border-theme-border py-1 h-12">
        <div className="ml-3 flex items-center w-full justify-between text-white/90">
          <div className="flex gap-2 items-center">
            <User className="w-4 h-4" />
            <h1 className="text-md">Profile</h1>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-theme-hover rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex md:flex-row flex-col">
        {/* Sidebar */}
        <div className="md:flex hidden w-[22%] h-screen bg-theme-surface border-r border-theme-border p-3 flex-col gap-2">
          <button
            onClick={() => setCurrentTab("Info")}
            className={`flex text-sm items-center ${currentTab == "Info" ? "bg-theme-hover" : "bg-theme-base"} hover:bg-theme-hover gap-1 px-3 py-2 rounded-[8px]`}
          >
            <UserCircle className="w-4 h-4" />
            <span>User Info</span>
          </button>
          <button
            onClick={() => setCurrentTab("Preferences")}
            className={`flex text-sm items-center ${currentTab == "Preferences" ? "bg-theme-hover" : "bg-theme-base"} hover:bg-theme-hover gap-1 px-3 py-2 rounded-[8px]`}
          >
            <Gear className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="flex items-center md:hidden p-2 gap-1">
          <button
            onClick={() => setCurrentTab("Info")}
            className={`flex text-sm items-center ${currentTab == "Info" ? "bg-theme-hover" : "bg-theme-base"} gap-1 px-3 py-1 rounded-[8px]`}
          >
            <UserCircle className="w-4 h-4" />
            <span>User Info</span>
          </button>
          <button
            onClick={() => setCurrentTab("Preferences")}
            className={`flex text-sm items-center ${currentTab == "Preferences" ? "bg-theme-hover" : "bg-theme-base"} gap-1 px-3 py-1 rounded-[8px]`}
          >
            <GearSixIcon className="w-4 h-4" />
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
