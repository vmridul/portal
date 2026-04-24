"use client";

import { useUIStore } from "@/store/uiStore";
import { useRoom, useRoomMembers, useMediaFiles } from "@/hooks";
import { useUserStore } from "@/store/useUserStore";
import { SidebarInfo } from "./sidebar-info/SidebarInfo";
import { SidebarMedia } from "./sidebar-media/SidebarMedia";
import { SidebarCalls } from "./sidebar-calls/SidebarCalls";

interface DetailsSidebarProps {
  id: string;
  type: "room" | "direct";
  title?: string;
}

export function DetailsSidebar({ id, type, title }: DetailsSidebarProps) {
  const { sidebarTab, setSidebarOpen } = useUIStore();
  const handleClose = () => setSidebarOpen(false);
  const { room, isLoading: isRoomLoading } = useRoom(id);
  const members = useRoomMembers(id);
  const { mediaFiles, isLoading: isMediaLoading } = useMediaFiles({
    conversationId: id,
  });
  const user = useUserStore((s) => s.user);

  switch (sidebarTab) {
    case "info":
      if (type === "direct") return null;
      return (
        <SidebarInfo
          id={id}
          type={type}
          room={room}
          members={members || []}
          currentUser={user}
          isLoading={isRoomLoading}
          onClose={handleClose}
        />
      );
    case "media":
      return (
        <SidebarMedia
          mediaFiles={mediaFiles || []}
          isLoading={isMediaLoading}
          onClose={handleClose}
        />
      );
    case "calls":
      return (
        <SidebarCalls
          roomId={id}
          conversationName={title}
          onClose={handleClose}
        />
      );
    default:
      return null;
  }
}
