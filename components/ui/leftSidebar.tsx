"use client";
import { useEffect, useState } from "react";
import { UserPlus, Plus, Menu, HouseIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useRooms } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { usePresence } from "@/contexts/presenceContext";
import { handleJoin } from "@/app/actions/joinRoom";
import { handleCreate } from "@/app/actions/createRoom";
import { handleSignOut } from "@/app/actions/signOut";
import { RoomList } from "./roomsList";
import { ProfileUI } from "./profileUI";
import { ProfileDialog } from "./profileDialog";
import { Press_Start_2P } from "next/font/google";
import { useUIStore } from "@/store/uiStore";
import { haptic } from "@/app/actions/haptic";

export const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

type LeftSidebarProps = {
  className?: string;
};

export default function LeftSidebar({ className = "" }: LeftSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinParam = searchParams.get("join");
  const [roomName, setRoomName] = useState("");
  const [createDialog, setCreateDialog] = useState(false);
  const [joinDialog, setJoinDialog] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [room_id, setRoomId] = useState<number | null>(null);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);
  const { rooms } = useRooms();
  const user = useUserStore((s) => s.user);
  const [profileDialog, setProfileDialog] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { awayUsers, setStatus } = usePresence();
  const { activeFriendPage } = useUIStore();

  //get current room from pathname
  useEffect(() => {
    const match = pathname.match(/\/portal\/room\/(\d+)/);
    if (match) {
      setCurrentRoom(Number(match[1]));
    } else {
      setCurrentRoom(null);
    }
  }, [pathname]);

  //open join dialog when path name have search params: join
  useEffect(() => {
    if (joinParam) {
      setRoomId(Number(joinParam));
      setJoinDialog(true);
    }
  }, [joinParam]);

  return (
    <>
      {profileDialog && (
        <ProfileDialog
          user={user}
          setProfileDialog={setProfileDialog}
          setStatus={setStatus}
          awayUsers={awayUsers}
        />
      )}
      {/* JOIN DIALOG */}

      <div
        className={`fixed ${joinDialog ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-95"} inset-0 z-[9999] bg-black bg-opacity-35 flex items-center justify-center transition-all duration-200`}
      >
        <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#05070d] border-[#313131] border p-6 text-white">
          Join Room
          <div className=" mt-3 flex text-md gap-2 text-sm items-center">
            <input
              required
              min={1000}
              max={9999}
              onChange={(e) => {
                const val = e.target.value;
                setRoomId(val === "" ? null : Number(val));
              }}
              className="outline-none border placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
              type="number"
              value={room_id ?? ""}
              placeholder="Room ID"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6 text-sm">
            <button
              onClick={() => {
                setRoomId(null);
                setJoinDialog(false);
              }}
              className=" ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (room_id) {
                  handleJoin({
                    room_id,
                    user_id: user?.user_id!,
                    setJoinDialog,
                    setRoomId,
                    setMobileMenu,
                  });
                }
              }}
              className="bg-white ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
            >
              Join
            </button>
          </div>
        </div>
      </div>
      {/* CREATE DIALOG */}

      <div
        className={`fixed ${createDialog ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-95"} bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-200`}
      >
        <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#05070d] border-[#313131] border p-6 text-white">
          Create Room
          <div className=" mt-3 flex text-md gap-2 text-sm items-center">
            <input
              required
              onChange={(e) => setRoomName(e.target.value)}
              value={roomName}
              className="outline-none border placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
              type="text"
              placeholder="Room Name"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6 text-sm">
            <button
              onClick={() => {
                setCreateDialog(false);
                setRoomName("");
              }}
              className=" ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleCreate({
                  roomName,
                  user,
                  setCreateDialog,
                  setRoomName,
                  setMobileMenu,
                  router,
                });
              }}
              className="bg-white ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
            >
              Create
            </button>
          </div>
        </div>
      </div>

      {/* LOG OUT DIALOG */}

      <div
        className={`fixed ${logoutDialog ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 scale-95 pointer-events-none"} inset-0 bg-black bg-opacity-35 z-[9999] flex items-center justify-center transition-all duration-200`}
      >
        <div className="w-96 rounded-xl text-lg md:scale-100 scale-[80%] font-regular bg-[#05070d] border-[#313131] border p-6 text-white">
          Are you sure you want to log out?
          <div className="text-[#676767] mt-2 text-sm">
            You can sign in back anytime.
          </div>
          <div className="flex justify-end gap-2 mt-6 text-sm">
            <button
              onClick={() => setLogoutDialog(false)}
              className="ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                handleSignOut();
              }}
              className="bg-white ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={() => { setMobileMenu(!mobileMenu) }}
          className={`z-[9999] ${activeFriendPage ? "hidden" : "block"} w-6 h-6 absolute top-2 left-2 text-white md:hidden`}
        >
          <Menu
            className={`${mobileMenu ? "rotate-180" : ""
              } text-white/60 ease-in-out hover:text-white/80 duration-200 w-5 h-5`}
          />
        </button>
        <div
          className={`bg-[#080f17] ${className} md:translate-y-0 translate-y-9 fixed md:static top-0 left-0 md:h-screen h-[calc(100dvh-40px)]
    border-[#322b45] border-r select-none transition-transform duration-300
    flex flex-col py-2 px-4 md:p-2 text-white items-center font-sans z-[1500]
    ${mobileMenu ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0`}
        >
          {!user?.user_id || !rooms ? (
            <Skeleton className="h-10 z-[9999] w-60 rounded-[8px]" />
          ) : (
            <div
              onClick={() => router.push("/portal")}
              className="group relative cursor-pointer w-56 h-9 border border-[#322b45] border-opacity-60 rounded-[8px] flex justify-center items-center"
            >
              <div className="absolute inset-0 rounded-[8px] bg-[url('/assets/portal.png')] opacity-20 group-hover:opacity-30 transition-all duration-300 ease-in-out bg-cover bg-center" />
              <div className="absolute inset-0 rounded-[8px] bg-black/10" />
              <div className="relative z-10 flex">
                <span
                  className={`text-white ${pixelFont.className} text-sm`}
                >
                  Portal
                </span>
              </div>
            </div>
          )}

          {!user?.user_id || !rooms ? (
            <Skeleton className="h-[80px] z-[9999] mt-2 w-60 rounded-[8px]" />
          ) : (
            <div className={`flex flex-col gap-2 mt-2 text-sm items-center`}>
              <button
                onClick={() => setCreateDialog(true)}
                className={`flex items-center bg-[#4a31b0] hover:text-white/80 justify-center gap-1 duration-200 w-56 py-2 rounded-[8px] text-white`}
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>

              <button
                onClick={() => setJoinDialog(true)}
                className="ease-in-out bg-[#161322] hover:bg-[#211f31] text-white/90 hover:text-white duration-200 flex items-center justify-center gap-2 border-[#1c1c1c] border w-56 py-2 rounded-[8px]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join Room</span>
              </button>
            </div>
          )}
          {!user?.user_id || !rooms ? (
            <div className="flex mt-2 flex-col gap-2 items-center">
              <Skeleton className="h-[24px] mt-2 w-[240px] rounded-[4px]" />
              <div className="flex mt-2 flex-col items-center gap-2">
                <div className="flex gap-2 items-center">
                  <Skeleton className="rounded-[8px] w-9 h-9" />
                  <div className="flex flex-col ">
                    <Skeleton className="h-[26px] mt-2 w-[190px] rounded-[4px]" />
                    <Skeleton className="h-[12px] mt-2 w-[120px] rounded-[4px]" />
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Skeleton className="rounded-[8px] w-9 h-9" />
                  <div className="flex flex-col ">
                    <Skeleton className="h-[26px] mt-2 w-[190px] rounded-[4px]" />
                    <Skeleton className="h-[12px] mt-2 w-[120px] rounded-[4px]" />
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Skeleton className="rounded-[8px] w-9 h-9" />
                  <div className="flex flex-col ">
                    <Skeleton className="h-[26px] mt-2 w-[190px] rounded-[4px]" />
                    <Skeleton className="h-[12px] mt-2 w-[120px] rounded-[4px]" />
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Skeleton className="rounded-[8px] w-9 h-9" />
                  <div className="flex flex-col ">
                    <Skeleton className="h-[26px] mt-2 w-[190px] rounded-[4px]" />
                    <Skeleton className="h-[12px] mt-2 w-[120px] rounded-[4px]" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="flex gap-36 items-center ml-3 text-[#aaaaaa]">
                <span className="text-xs">Rooms</span>
                <div className="bg-[#211f31] rounded-[8px] px-2 py-1 flex text-white/60 text-xs items-center gap-0.5">
                  <HouseIcon className="w-3 h-3 cursor-pointer" />
                  {rooms.length ?? 0}
                </div>
              </div>
              <RoomList
                router={router}
                setMobileMenu={setMobileMenu}
                currentRoom={currentRoom}
              />
            </div>
          )}
          {!user?.username || !user?.user_id || !user?.avatar ? (
            <Skeleton className="h-16 w-60 absolute bottom-2 z-[9999]  rounded-[8px]" />
          ) : (
            <ProfileUI
              user={user}
              awayUsers={awayUsers}
              setProfileDialog={setProfileDialog}
              setLogoutDialog={setLogoutDialog}
            />
          )}
        </div>
      </div>
    </>
  );
}
