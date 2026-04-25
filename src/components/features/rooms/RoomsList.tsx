import { useRouter } from "next/navigation";
import { useRooms } from "@/contexts/roomContext";
import { RoomItem } from "./RoomItem";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon } from "@hugeicons/core-free-icons";
import { useVisibleActiveCalls } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import type { UserRoom } from "@/lib/types/room";

interface RoomListProps {
  currentRoom?: string | number | null;
}

export const RoomsList = ({ currentRoom }: RoomListProps) => {
  const { rooms } = useRooms();
  const { activeCalls } = useVisibleActiveCalls();
  const activeCallRoomIds = new Set(activeCalls.map((call) => call.roomId));
  const { setLeftMobileMenu } = useUIStore();
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col max-h-[450px] md:max-h-[498px] rounded-b-[8px] text-sm overflow-y-scroll no-scrollbar text-white">
        {rooms.length === 0 ? (
          <div className="rounded-[14px] text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[12px] border border-theme-border bg-theme-base">
              <HugeiconsIcon
                icon={Home01Icon}
                className="h-5 w-5 text-gray-400"
              />
            </div>
            <p className="mt-4 text-xs text-gray-400">No rooms yet</p>{" "}
          </div>
        ) : (
          rooms.map((room: UserRoom) => {
            return (
              <RoomItem
                key={room?.Rooms?.room_id}
                room={room}
                router={router}
                setMobileMenu={setLeftMobileMenu}
                currentRoom={currentRoom}
                hasActiveCall={activeCallRoomIds.has(room.room_id)}
              />
            );
          })
        )}
      </div>
    </>
  );
};
