import { useRouter } from "next/navigation";
import { useRooms } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { RoomItem } from "./RoomItem";
import { House } from "lucide-react";

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

interface RoomListProps {
  router: ReturnType<typeof useRouter>;
  setMobileMenu?: (value: boolean) => void;
  currentRoom?: string | number | null;
}

export const RoomsList = ({
  router,
  setMobileMenu,
  currentRoom,
}: RoomListProps) => {
  const user = useUserStore((s) => s.user);
  const { rooms } = useRooms();
  return (
    <>
      <div className="flex flex-col max-h-[450px] md:max-h-[498px] rounded-b-[8px] text-sm overflow-y-scroll no-scrollbar text-white">
        {rooms.length === 0 ? (
          <div className="rounded-[14px] text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[12px] border border-theme-border bg-theme-base">
              <House className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-4 text-xs text-gray-400">
              No rooms yet
            </p>{" "}
          </div>
        ) : (
          rooms.map((room: RoomWithNested) => (
            <RoomItem
              key={room?.Rooms?.room_id}
              room={room}
              router={router}
              setMobileMenu={setMobileMenu}
              currentRoom={currentRoom}
              user={user}
            />
          )))}
      </div>
    </>
  );
};
