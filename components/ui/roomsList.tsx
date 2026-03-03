import { useRouter } from "next/navigation";
import { useRooms } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { RoomItem } from "./roomItem";

export const RoomList = ({
  router,
  setMobileMenu,
  currentRoom,
}: {
  router: ReturnType<typeof useRouter>;
  setMobileMenu?: (value: boolean) => void;
  currentRoom?: number | null;
}) => {
  const user = useUserStore((s) => s.user);
  const { rooms } = useRooms();
  return (
    <>
      <div className="flex flex-col max-h-[450px] md:max-h-[498px] rounded-b-[8px] text-sm overflow-y-scroll no-scrollbar text-white">
        {rooms.map((room: any) => (
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
