import { useState, useEffect } from "react";
import { useColor } from "@/contexts/colorContext";
import { Phone } from "lucide-react";

interface RoomWithNested {
  room_id: string;
  memberCount: number;
  owner_id?: string | null;
  joined_at?: number;
  unread_count?: number;
  last_msg_preview?: string;
  last_msg_time?: number;
  Rooms?: {
    room_name?: string;
    room_id?: string;
  } | null;
}

interface RoomItemProps {
  room: RoomWithNested;
  router: { push: (href: string) => void };
  setMobileMenu?: (value: boolean) => void;
  currentRoom?: string | number | null;
  hasActiveCall?: boolean;
}

export function RoomItem({
  room,
  router,
  setMobileMenu,
  currentRoom,
  hasActiveCall = false,
}: RoomItemProps) {
  const [mounted, setMounted] = useState(false);
  const unreadCount = room?.unread_count || 0;
  const { color, textColor } = useColor();

  useEffect(() => {
    setMounted(true);
  }, []);

  const roomId = room?.Rooms?.room_id ?? room?.room_id ?? "";
  const roomName = room?.Rooms?.room_name ?? "";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setMobileMenu?.(false);
        router.push(`/portal/room/${roomId}`);
      }}
      className={`cursor-pointer relative flex items-center gap-3 mt-2 ml-1 rounded-[8px] py-2 px-2 hover:bg-theme-hover ${currentRoom?.toString() === roomId &&
        "bg-theme-hover"
        }`}
      key={roomId}
    >
      <div className="relative flex-shrink-0">
        <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white opacity-90 w-10 h-10">
          {roomName?.charAt(0).toUpperCase()}
        </div>
        {hasActiveCall && (
          <Phone className="rounded-full text-green-500 bg-theme-hover border border-theme-border p-0.5 absolute -right-1 bottom-0 h-4 w-4 fill-current" />
        )}
      </div>

      <div className="flex items-center flex-1 min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className={`truncate max-w-[100px] text-white`}>
              {roomName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#aaaaaa] text-xs truncate max-w-[150px]">
              ID: {roomId}
            </span>
          </div>
        </div>
        {mounted && unreadCount > 0 && currentRoom?.toString() !== roomId && (
          <div
            className="flex-shrink-0 w-4 h-4 rounded-full items-center justify-center flex"
            style={{ backgroundColor: color, color: textColor }}
          >
            <span className="text-[8px] font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
