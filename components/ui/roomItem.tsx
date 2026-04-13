
import { useState, useEffect } from "react";
import { useColor } from "@/contexts/colorContext";

export function RoomItem({
  room,
  router,
  setMobileMenu,
  currentRoom,
  user,
}: any) {
  const [mounted, setMounted] = useState(false);
  const unreadCount = room?.unread_count || 0;
  const { color } = useColor();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCurrentRoom = currentRoom?.toString() === room?.Rooms?.room_id?.toString();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setMobileMenu?.(false);
        router.push(`/portal/room/${room?.Rooms?.room_id}`);
      }}
      className={`cursor-pointer relative flex items-center gap-3 mt-2 rounded-[8px] py-2 px-2 hover:bg-theme-hover ${currentRoom?.toString() === room?.Rooms?.room_id.toString() &&
        "bg-theme-hover"
        }`}
      key={room?.Rooms?.room_id}
    >
      <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white opacity-90 w-10 h-10 flex-shrink-0">
        {room?.Rooms?.room_name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate max-w-[100px]">{room?.Rooms?.room_name}</span>
          <span className="text-white/40 text-xs">
            ID: {room?.Rooms?.room_id}
          </span>
        </div>
        {mounted && unreadCount > 0 && !isCurrentRoom && (
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
