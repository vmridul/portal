import { useState, useEffect } from "react";
import { X, Image as ImageIcon, FileText, Hash } from "lucide-react";
import Image from "next/image";
import { useUIStore } from "@/store/uiStore";
import { useRoom, useRoomMembers, useMediaFiles } from "@/hooks";
import { useUserStore } from "@/store/useUserStore";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarInfoView } from "./sidebar/SidebarInfoView";
import { SidebarMediaView } from "./sidebar/SidebarMediaView";

interface DetailsSidebarProps {
  id: string;
  type: "room" | "direct";
}

export function DetailsSidebar({ id, type }: DetailsSidebarProps) {
  const { isSidebarOpen, sidebarTab, setSidebarOpen } = useUIStore();
  const { room, isLoading: isRoomLoading } = useRoom(id);
  const members = useRoomMembers(id);
  const { mediaFiles, isLoading: isMediaLoading } = useMediaFiles({ conversationId: id });
  const user = useUserStore((s) => s.user);

  if (!isSidebarOpen) return null;

  const renderContent = () => {
    switch (sidebarTab) {
      case "info":
        return (
          <SidebarInfoView
            id={id}
            type={type}
            room={room}
            members={members || []}
            currentUser={user}
            isLoading={isRoomLoading}
          />
        );
      case "media":
        return (
          <SidebarMediaView
            mediaFiles={mediaFiles || []}
            isLoading={isMediaLoading}
          />
        );
      default:
        return null;
    }
  };

  const getSidebarTitle = () => {
    switch (sidebarTab) {
      case "info":
        return `${type === "room" ? "Room" : "Friend"} Info`;
      case "media":
        return "Media Gallery";
      default:
        return sidebarTab;
    }
  };

  return (
    <div className="w-[320px] h-full bg-theme-base border-l border-theme-border flex flex-col">
      <SidebarHeader
        title={getSidebarTitle()}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
