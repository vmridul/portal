import { useRouter } from "next/navigation";
import { useRooms } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { RoomItem } from "./roomItem";

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

interface RoomListProps {
  router: ReturnType<typeof useRouter>;
  setMobileMenu?: (value: boolean) => void;
  currentRoom?: string | number | null;
}

export const RoomList = ({
  router,
  setMobileMenu,
  currentRoom,
}: RoomListProps) => {
  const user = useUserStore((s) => s.user);
  const { rooms } = useRooms();
  return (
    <>
      <div className="flex flex-col max-h-[450px] md:max-h-[498px] rounded-b-[8px] text-sm overflow-y-scroll no-scrollbar text-white">
        {rooms.map((room: RoomWithNested) => (
          <RoomItem
            key={room?.Rooms?.room_id}
            room={room}
            router={router}
            setMobileMenu={setMobileMenu}
            currentRoom={currentRoom}
            user={user}
          />
        ))}
      </div>
    </>
  );
};
