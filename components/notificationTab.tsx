"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
export default function NotificationTab() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const { activeFriendPage } = useUIStore();
  return (
    <>
      <button
        onClick={() => setMobileMenu(!mobileMenu)}
        className={`z-[9999] ${activeFriendPage ? "hidden" : "block"} w-6 h-6 absolute top-1.5 right-2 text-white md:hidden`}
      >
        <Bell className="text-white/90 ml-1 w-4 h-4" />
      </button>
      <div className={`md:w-[360px] w-[300px] select-none
    transition-transform duration-300 ease-in-out
    h-screen
    fixed top-0 right-0 z-[9000]
    md:translate-y-0 translate-y-9
    ${mobileMenu ? "translate-x-0" : "translate-x-full"}

    md:static md:translate-x-0 border-[#322b45] border-l bg-[#080f17] font-sans p-4`}></div>
    </>
  );
}
