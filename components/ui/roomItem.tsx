
import { useState, useEffect } from "react";
import { useColor } from "@/contexts/colorContext";
import type { User } from "@/lib/types";

interface RoomWithNested {
  room_id: string;
  memberCount: number;
  owner_id?: string | null;
  joined_at?: number;
  unread_count?: number;
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
  user: User | null;
}

export function RoomItem({
  room,
  router,
  setMobileMenu,
  currentRoom,
  user,
}: RoomItemProps) {
  const [mounted, setMounted] = useState(false);
  const unreadCount = room?.unread_count || 0;
  const { color } = useColor();

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
      className={`cursor-pointer relative flex items-center gap-3 mt-2 rounded-[8px] py-2 px-2 hover:bg-theme-hover ${currentRoom?.toString() === roomId &&
        "bg-theme-hover"
        }`}
      key={roomId}
    >
      <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white opacity-90 w-10 h-10 flex-shrink-0">
        {roomName?.charAt(0).toUpperCase()}
      </div>
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate max-w-[100px]">{roomName}</span>
          <span className="text-white/40 text-xs">
            ID: {roomId}
          </span>
        </div>
        {mounted && unreadCount > 0 && currentRoom?.toString() !== roomId && (
          <div 
            className="flex-shrink-0 w-4 h-4 rounded-full items-center justify-center flex ml-2"
            style={{ backgroundColor: color }}
          >
            <span className="text-[8px] font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
