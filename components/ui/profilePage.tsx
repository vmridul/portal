"use client";
import { useState } from "react";
import { User, CircleUser, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserInfoTab } from "./userInfoTab";
import { PreferencesTab } from "./preferencesTab";

export default function ProfilePageContent() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("Info");

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
