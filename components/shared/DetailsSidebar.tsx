import { useUIStore } from "@/store/uiStore";
import { useRoom, useRoomMembers, useMediaFiles } from "@/hooks";
import { useUserStore } from "@/store/useUserStore";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarInfoView } from "./sidebar/SidebarInfoView";
import { SidebarMediaView } from "./sidebar/SidebarMediaView";
import CallSidebar from "./sidebar/CallSidebar";

interface DetailsSidebarProps {
  id: string;
  type: "room" | "direct";
  title?: string;
}

export function DetailsSidebar({ id, type, title }: DetailsSidebarProps) {
  const { isSidebarOpen, sidebarTab, setSidebarOpen } = useUIStore();
  const { room, isLoading: isRoomLoading } = useRoom(id);
  const members = useRoomMembers(id);
  const { mediaFiles, isLoading: isMediaLoading } = useMediaFiles({ conversationId: id });
  const user = useUserStore((s) => s.user);

  if (!isSidebarOpen) return null;

  const renderContent = () => {
    switch (sidebarTab) {
      case "info":
        if (type === "direct") return null;
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
      case "calls":
        return <CallSidebar roomId={id} conversationName={title} />;
      default:
        return null;
    }
  };

  const getSidebarTitle = () => {
    switch (sidebarTab) {
      case "info":
        return type === "room" ? "Room Info" : "";
      case "media":
        return "Media Gallery";
      case "calls":
        return "Calls";
      default:
        return sidebarTab;
    }
  };

  return (
    <div className="w-[320px] h-full min-h-0 bg-theme-base border-l border-theme-border flex flex-col">
      <SidebarHeader
        title={getSidebarTitle()}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
