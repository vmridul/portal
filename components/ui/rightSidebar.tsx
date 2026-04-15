import { useEffect, useState, useRef } from "react";
import { UserX, Clipboard, Users, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "./skeleton";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { usePresence } from "@/contexts/presenceContext";
import { RoomMembersList } from "./roomMembersList";
import { ListSkeleton } from "./listSkeleton";
import { useRooms } from "@/contexts/roomContext";
import { useRoomMembers } from "@/src/hooks";
import { useOutsideClick } from "@/hooks/ui/useOutsideClick";
import type { UserRoom, RoomMemberWithUser, User } from "@/lib/types";

export default function RightSidebar({ room_id }: { room_id: string }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const user = useUserStore((s) => s.user);
  const [rightMobileMenu, setRightMobileMenu] = useState(false);
  const { onlineUsers, awayUsers } = usePresence();
  
  const menuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(menuRef, () => setOpenMenu(false));

  const {
    rooms,
    membersCount: allMembersCount,
    isLoading: isRoomsLoading,
  } = useRooms();
  const room = rooms.find((r) => r.room_id === room_id);
  const roomName = room?.Rooms?.room_name ?? "";
  const createdAt = room?.joined_at ?? 0;
  const memberCount = room ? (allMembersCount[room_id] ?? 0) : 0;

  const members = useRoomMembers(room_id);
  const owner = members.find((m) => m.role === "owner");
  const owner_id = owner?.user_id ?? "";
  const ownerName = owner?.Users?.username ?? "";





  return (
    <>
      <button
        onClick={() => {
          setRightMobileMenu(!rightMobileMenu);
        }}
        className="z-[3000] w-6 h-6 absolute top-3 right-2 text-white md:hidden"
      >
        <Users className="text-white w-4 h-4" />
      </button>

      <div
        className={`bg-theme-base px-2 h-screen border-theme-border border-l
    text-white
    select-none
    transition-transform duration-300 ease-in-out
    fixed top-0 right-0 z-[60] w-70
    md:translate-y-0 translate-y-10
    ${rightMobileMenu ? "translate-x-0" : "translate-x-full"}

    md:static md:translate-x-0`}
      >
        {!user?.user_id || isRoomsLoading || !roomName ? (
          <Skeleton className="h-[56px] mt-2 w-[268px]  rounded-[8px]" />
        ) : (
          <div className="relative w-[268px] flex items-center justify-between mt-2 rounded-[8px] py-2 px-2">
            <div className="flex gap-3 items-center">
              <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white opacity-90 w-10 h-10">
                {roomName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col rounded-[8px]">
                <span className="truncate max-w-[120px]">{roomName}</span>
                <span className="text-white/40 text-xs">ID: {room_id}</span>
              </div>
            </div>
            <div ref={menuRef} className="flex gap-1 items-center">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu((v) => !v);
                }}
                className="w-8 h-8 cursor-pointer flex items-center justify-center hover:bg-theme-hover rounded-[12px]"
              >
                <Menu className="w-4 h-4 text-white/90 hover:text-gray-200 cursor-pointer" />
              </div>
              <div
                className={`
    absolute right-0 text-white/90 flex flex-col text-xs overflow-hidden items-start top-[48px] mt-1
    min-w-[80px]
    rounded-[8px] bg-theme-surface border border-theme-border
    shadow-lg
    transform transition-all duration-150 select-none
 ease-out
    ${
      openMenu
        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
        : "opacity-0 scale-95 translate-y-1 pointer-events-none"
    }
  `}
              >
                <div
                  onClick={() => {
                    navigator.clipboard.writeText(room_id);
                    toast.success("Room ID copied to clipboard");
                  }}
                  className="border-b cursor-pointer border-theme-border flex items-center hover:bg-theme-hover"
                >
                  <Clipboard className="w-4 h-4 ml-3 mr-2 text-white/90" />
                  <button className="w-32 text-start py-3">Copy Room ID</button>
                </div>
                <div
                  onClick={() => {
                    import("@/store/uiStore").then(m => m.useUIStore.getState().setModal("LEAVE_ROOM", { roomName, owner_id, room_id }))
                  }}
                  className="flex items-center cursor-pointer hover:bg-theme-hover text-red-200"
                >
                  <UserX className="w-4 h-4 ml-3 mr-2" />
                  <button className="w-32 text-start py-3">
                    {owner_id === (user?.user_id ?? "")
                      ? "Delete Room"
                      : "Leave Room"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {!user?.user_id || members.length === 0 ? (
          <ListSkeleton />
        ) : (
          <RoomMembersList
            members={members}
            memberCount={memberCount}
            onlineUsers={onlineUsers}
            awayUsers={awayUsers}
            user={user}
          />
        )}
      </div>
    </>
  );
}
