"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Info, UserX, Clipboard, Users, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "./skeleton";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { usePresence } from "@/contexts/presenceContext";
import { fetchMembers } from "@/app/actions/fetchMembers";
import { handleChangeRoomName } from "@/app/actions/changeRoomName";
import { RoomMembersList } from "./roomMembersList";
import { RoomInfoDialog } from "./roomInfoDialog";
import { LeaveDialog } from "./leaveDialog";
import { useRoomInfo } from "@/hooks/useRooomInfo";
import { ListSkeleton } from "./listSkeleton";


export default function RightSidebar({ room_id }: { room_id: string }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [infoDialog, setInfoDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const user = useUserStore((s) => s.user);
  const [rightMobileMenu, setRightMobileMenu] = useState(false);
  const { onlineUsers, awayUsers } = usePresence();
  const {
    roomName,
    memberCount,
    ownerName,
    members,
    setMembers,
    createdAt,
    owner_id,
  } = useRoomInfo(room_id);

  useEffect(() => {
    setNewRoomName(roomName);
  }, [roomName]);

  //for real time room member updates
  useEffect(() => {
    const channel = supabase
      .channel(`room-members-${room_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "RoomMembers",
          filter: `room_id=eq.${room_id}`,
        },
        async () => {
          fetchMembers({ room_id, setMembers });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "RoomMembers",
          filter: `room_id=eq.${room_id}`,
        },
        (payload) => {
          const leftUserId = payload.old.user_id;

          setMembers((prev) => prev.filter((m) => m.user_id !== leftUserId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room_id]);

  //for menu click close
  useEffect(() => {
    const close = () => setOpenMenu(false);
    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  return (
    <>
      {infoDialog && (
        <RoomInfoDialog
          setInfoDialog={setInfoDialog}
          createdAt={createdAt}
          owner_id={owner_id}
          ownerName={ownerName}
          roomName={roomName}
          newRoomName={newRoomName}
          setNewRoomName={setNewRoomName}
          user={user}
          handleChangeRoomName={handleChangeRoomName}
          room_id={room_id}
        />
      )}
      {leaveDialog && (
        <LeaveDialog
          owner_id={owner_id}
          user={user}
          roomName={roomName}
          room_id={room_id}
          setLeaveDialog={setLeaveDialog}
          router={router}
        />
      )}
      <button
        onClick={() => { setRightMobileMenu(!rightMobileMenu) }}
        className="z-[2100] w-6 h-6 absolute top-2 right-2 text-white md:hidden"
      >
        <Users className="text-white/60 w-4 h-4" />
      </button>

      <div
        className={`bg-[#080f17] px-2 h-screen border-[#322b45] border-l
    text-white
    select-none
    transition-transform duration-300 ease-in-out

    fixed top-0 right-0 z-[60] w-70
    md:translate-y-0 translate-y-10
    ${rightMobileMenu ? "translate-x-0" : "translate-x-full"}

    md:static md:translate-x-0`}
      >
        {!user?.user_id || !roomName ? (
          <Skeleton className="h-[56px] mt-2 w-[268px]  rounded-[8px]" />
        ) : (
          <div className="relative w-[268px] flex items-center justify-between mt-2 rounded-[8px] py-2 px-2">
            <div className="flex gap-3 items-center">
              <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white opacity-90 w-10 h-10">
                {roomName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col rounded-[8px]">
                {roomName}
                <span className="text-white/40 text-xs">ID: {room_id}</span>
              </div>
            </div>
            <div className="flex gap-1 items-center">
              <div
                onClick={() => setInfoDialog(true)}
                className="w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-[#211f31] rounded-[12px]"
              >
                <Info className="w-5 h-5 text-white/90 hover:text-gray-200 cursor-pointer" />
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu((v) => !v);
                }}
                className="w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-[#211f31] rounded-[12px]"
              >
                <Menu className="w-5 h-5 text-white/90 hover:text-gray-200 cursor-pointer" />
              </div>
              <div
                className={`
    absolute right-0 text-white/90 flex flex-col overflow-hidden items-start top-full mt-1
    min-w-[140px]
    rounded-[8px] bg-[#0f1320] border border-[#3a3a3a]
    shadow-lg text-sm
    transform transition-all duration-150 select-none
 ease-out
    ${openMenu
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
                  className="border-b cursor-pointer border-[#3a3a3a] flex items-center hover:bg-[#222636]"
                >
                  <Clipboard className="w-4 h-4 ml-3 mr-2 text-white/90" />
                  <button className=" w-32 text-start py-3">
                    Copy Room ID
                  </button>
                </div>
                <div
                  onClick={() => {
                    setLeaveDialog(true);
                  }}
                  className="flex items-center cursor-pointer hover:bg-[#302727] text-red-200"
                >
                  <UserX className="w-4 h-4 ml-3 mr-2" />
                  <button className="w-32 text-start py-3">{`${owner_id == user?.user_id ? "Delete Room" : "Leave Room"
                    }`}</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="w-full h-0 border border-[#313131] mt-2"></div>
        {!user?.user_id || !members ? (
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
