"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Info,
  UserX,
  Clipboard,
  Ellipsis,
  User,
  Users,
  Moon,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "./skeleton";
import { formatToIST } from "@/app/actions/formatToIST";
import { useRooms } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { useGlobalPresence } from "@/hooks/useGlobalPresence";

export default function RightSidebar({ room_id }: { room_id: string }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [infoDialog, setInfoDialog] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const { rooms, membersCount } = useRooms();
  const room = rooms.find((room) => room.room_id == room_id);
  const memberCount = room ? membersCount[room.room_id] : 0;
  const roomName = room?.Rooms?.room_name;
  const owner = members.find((member) => member.role == "owner");
  const [ownerName, setOwnerName] = useState("");
  const user = useUserStore((s) => s.user);
  const [rightMobileMenu, setRightMobileMenu] = useState(false);
  const { onlineUsers, awayUsers } = useGlobalPresence();

  useEffect(() => {
    if (!owner) return;
    const fetchOwnerName = async () => {
      const { data, error } = await supabase
        .from("Users")
        .select("*")
        .eq("user_id", owner.user_id)
        .single();

      if (error) throw error;
      setOwnerName(data.username);
    };
    fetchOwnerName();
  }, [room_id, owner]);

  useEffect(() => {
    setNewRoomName(roomName);
  }, [roomName]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("RoomMembers")
      .select(
        `
    user_id,
    role,
    Users (
      user_id,
      username,
      avatar
    )
  `
      )
      .eq("room_id", room_id)
      .order("username", { foreignTable: "Users", ascending: true });

    if (error) throw error;
    setMembers(data);
  };

  useEffect(() => {
    fetchMembers();
  }, [room_id]);

  const handleDeleteRoom = async () => {
    const { data, error } = await supabase
      .from("Rooms")
      .delete()
      .eq("room_id", room_id);

    if (error) throw error;
    toast.success("Room deleted successfully");
    router.replace("/home");
  };

  const handleChangeName = async () => {
    const { data, error } = await supabase
      .from("Rooms")
      .update({ room_name: newRoomName })
      .eq("room_id", room_id)
      .select()
      .single();

    if (error) throw error;
    setNewRoomName(data.room_name);
    setInfoDialog(false);
    toast.success("Changed room name");
  };

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
          await fetchMembers();
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

  const handleLeaveRoom = async () => {
    const { error } = await supabase
      .from("RoomMembers")
      .delete()
      .eq("room_id", room_id)
      .eq("user_id", user?.user_id);
    if (error) throw error;
    await supabase.from("Messages").insert({
      room_id,
      sender_id: user?.user_id,
      type: "leave",
      content: "left the room",
    });
    setLeaveDialog(false);
    toast.success("Room left successfully");
    router.push(`/home`);
  };

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
        <div
          className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-300`}
        >
          <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#080f17] border-[#313131] border p-6 text-white">
            Room Information
            <div className=" mt-3 flex flex-col gap-2 text-sm">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-white/60">Room Name</span>
                <input
                  className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
                  type="text"
                  disabled={owner?.user_id != user?.user_id}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room Name"
                  minLength={3}
                  maxLength={16}
                  value={newRoomName}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-white/60">Room Owner</span>
                <input
                  className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
                  type="text"
                  disabled
                  value={ownerName}
                  placeholder="Room Owner"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-white/60">Created On</span>
                <input
                  className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
                  type="text"
                  disabled
                  value={formatToIST(room?.Rooms?.created_at)}
                  placeholder="Room Owner"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 text-sm">
              <button
                onClick={() => {
                  setInfoDialog(false);
                  setNewRoomName(roomName);
                }}
                className="bg-[#080f17] ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={newRoomName === roomName}
                onClick={handleChangeName}
                className="bg-white disabled:opacity-50 ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
              >
                Change Name
              </button>
            </div>
          </div>
        </div>
      )}
      {leaveDialog && (
        <div
          className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-300`}
        >
          <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#080f17] border-[#313131] border p-6 text-white">
            <span>{`${
              owner?.user_id == user?.user_id
                ? "Are you sure you want to delete the room "
                : "Are you sure you want to leave the room "
            }`}</span>
            <span className="font-bold">{roomName} ?</span>
            <div className="text-[#676767] mt-2 text-sm">
              {`${
                owner?.user_id == user?.user_id
                  ? "You won't be able to revert this action!"
                  : "You can join back anytime using the Room ID."
              }`}
            </div>
            <div className="flex justify-end gap-2 mt-6 text-sm">
              <button
                onClick={() => setLeaveDialog(false)}
                className="bg-[#080f17] ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={
                  owner?.user_id == user?.user_id
                    ? handleDeleteRoom
                    : handleLeaveRoom
                }
                className="bg-white ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
              >
                {`${owner?.user_id == user?.user_id ? "Delete" : "Leave"}`}
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setRightMobileMenu(!rightMobileMenu)}
        className="z-[1000] w-6 h-6 absolute top-2 right-2 text-white md:hidden"
      >
        <Users className="text-white/60 w-4 h-4" />
      </button>

      <div
        className={`bg-[#080f17] px-2 h-screen border-[#322b45] border-l
    text-white
    select-none
    transition-transform duration-300 ease-in-out

    /* mobile overlay */
    fixed top-0 right-0 z-[60] w-70
    md:translate-y-0 translate-y-10
    ${rightMobileMenu ? "translate-x-0" : "translate-x-full"}

    /* desktop layout */
    md:static md:translate-x-0`}
      >
        {!user?.user_id || !rooms || !roomName ? (
          <Skeleton className="h-[56px] mt-2 w-[268px] bg-[#313131] rounded-[8px]" />
        ) : (
          <div className="relative w-[268px] flex items-center justify-between mt-2 rounded-[8px] py-2 px-2">
            <div className="flex gap-3 items-center">
              <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white opacity-90 w-10 h-10">
                {roomName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col rounded-[8px] cursor-pointer">
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
                <Ellipsis className="w-5 h-5 text-white/90 hover:text-gray-200 cursor-pointer" />
              </div>
              <div
                className={`
    absolute right-0 text-white/90 flex flex-col overflow-hidden items-start top-full mt-1
    min-w-[140px]
    rounded-[8px] bg-[#0f1320] border border-[#3a3a3a]
    shadow-lg text-sm
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
                  <button className="w-32 text-start py-3">{`${
                    owner?.user_id == user?.user_id
                      ? "Delete Room"
                      : "Leave Room"
                  }`}</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="w-full h-0 border border-[#313131] mt-2"></div>
        {!user?.user_id || !members ? (
          <Skeleton className="h-[656px] mt-2 w-[268px] bg-[#313131] rounded-[8px]" />
        ) : (
          <div className="mt-3">
            <div className="flex items-center gap-40">
              <span className="text-xs ml-2 text-[#aaaaaa]">Members</span>
              <div className="bg-[#211f31] rounded-[8px] px-2 py-1 flex text-white/60 text-xs items-center gap-0.5">
                <User className="w-3 h-3 cursor-pointer" />
                {memberCount}
              </div>
            </div>

            <div className="mt-2">
              {members?.map((member) => {
                const isUserOnline = onlineUsers.has(member.user_id.toString());
                const isUserAway = awayUsers.has(member.user_id.toString());
                return (
                  <div className="text-sm ml-2 mt-2" key={member.user_id}>
                    <div className="flex gap-4 items-center">
                      <div className="relative">
                        <Image
                          src={
                            member?.Users?.user_id == user?.user_id
                              ? user?.avatar
                              : member?.Users?.avatar
                          }
                          alt="Avatar"
                          width={30}
                          height={30}
                          unoptimized
                          className="border w-8 h-8 border-[#313131] rounded-[10px]"
                        />
                        {member.user_id &&
                        awayUsers.has(member.user_id.toString()) ? (
                          <Moon
                            fill="yellow"
                            className="absolute text-yellow-400 right-0 bottom-0 w-[10px] h-[10px] opacity-90"
                          />
                        ) : (
                          <div className="z-[9999] absolute right-0 bottom-0 w-2 h-2 opacity-90 bg-green-500 border border-[#59ab44] rounded-full"></div>
                        )}
                        {!isUserOnline && !isUserAway && (
                          <div className="z-[9999] absolute right-0 bottom-0 w-2 h-2 opacity-100 bg-gray-500 border border-[#858585] rounded-full"></div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        {member?.Users?.user_id == user?.user_id
                          ? user?.username
                          : member?.Users?.username}
                        {member.role && (
                          <span className="text-[#aaaaaa] font-extralight">
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
