"use client";
import { useEffect, useState } from "react";
import { UserPlus, Plus, Menu, HouseIcon, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useRooms } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { getAuth, signOut } from "firebase/auth";
import { RoomList } from "./roomsList";
import { useRoomActions } from "@/src/hooks";
import { toast } from "sonner";
import { generateRoomCode } from "@/app/actions/randomID";
import { usePresence } from "@/contexts/presenceContext";
import { ProfileUI } from "./profileUI";
import { Press_Start_2P } from "next/font/google";
import { useUIStore } from "@/store/uiStore";
import { useColor } from "@/contexts/colorContext";

export const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

type LeftSidebarProps = {
  className?: string;
  showPortalSkeletons?: boolean;
};

export default function LeftSidebar({
  className = "",
  showPortalSkeletons = true,
}: LeftSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinParam = searchParams.get("join");
  const [roomName, setRoomName] = useState("");
  const [room_id, setRoomId] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const { rooms, isLoading: isRoomsLoading } = useRooms();
  const user = useUserStore((s) => s.user);
  const { color, textColor } = useColor();
  const [mobileMenu, setMobileMenu] = useState(false);
  const { awayUsers, setStatus } = usePresence();
  const {
    activeFriendPage,
    joinDialog,
    setJoinDialog,
    createDialog,
    setCreateDialog,
    logoutDialog,
    setLogoutDialog,
  } = useUIStore();
  const { joinRoom, createRoom } = useRoomActions();

  const onJoin = async () => {
    if (!room_id) {
      toast.error("Enter a Room ID!");
      return;
    }
    try {
      await joinRoom({ room_id });
      setJoinDialog(false);
      setRoomId(null);
      setMobileMenu(false);
      toast.success("Room joined successfully");
      router.replace(`/portal/room/${room_id}`);
    } catch (e) {
      const msg = (e as Error).message || "Failed to join room";
      if (msg.includes("already in this room")) {
        toast.info("You are already in this room");
        setJoinDialog(false);
        setMobileMenu(false);
        router.replace(`/portal/room/${room_id}`);
        setRoomId(null);
      } else {
        toast.error("Failed to join room");
      }
    }
  };

  const onCreate = async () => {
    if (!roomName) {
      toast.error("Enter a valid room name!");
      return;
    }
    try {
      const generated_id = await generateRoomCode();
      await createRoom({ room_name: roomName, room_id: generated_id.toString() });
      setCreateDialog(false);
      setRoomName("");
      setMobileMenu(false);
      toast.success("Room created successfully");
      router.push(`/portal/room/${generated_id}`);
    } catch (e) {
      toast.error((e as Error).message || "Failed to create room");
    }
  };

  //get current room from pathname
  useEffect(() => {
    const match = pathname.match(/\/portal\/room\/([^/]+)/);
    if (match) {
      setCurrentRoom(match[1]);
    } else {
      setCurrentRoom(null);
    }
  }, [pathname]);

  //open join dialog when path name have search params: join
  useEffect(() => {
    if (joinParam) {
      setRoomId(joinParam);
      setJoinDialog(true);
      router.replace(pathname);
    }
  }, [joinParam, pathname, router, setJoinDialog]);

  return (
    <>
      <div
        className={`fixed ${joinDialog ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-95"} inset-0 z-[9999] bg-black bg-opacity-35 flex items-center justify-center transition-all duration-200`}
      >
        <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white">
          Join Room
          <div className=" mt-3 flex text-md gap-2 text-sm items-center">
            <input
              required
              min={1000}
              max={9999}
              onChange={(e) => {
                const val = e.target.value;
                setRoomId(val === "" ? null : val);
              }}
              className="outline-none border placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
              type="text"
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
              className=" ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={onJoin}
              style={{ backgroundColor: color, color: textColor }}
              className="ease-in-out hover:brightness-110 py-2 px-6 rounded-xl"
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
        <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white">
          Create Room
          <div className=" mt-3 flex text-md gap-2 text-sm items-center">
            <input
              required
              onChange={(e) => setRoomName(e.target.value)}
              value={roomName}
              className="outline-none border placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
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
              className=" ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              style={{ backgroundColor: color, color: textColor }}
              className="ease-in-out hover:brightness-110 py-2 px-6 rounded-xl"
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
        <div className="w-96 rounded-xl text-lg md:scale-100 scale-[80%] font-regular bg-theme-surface border-theme-border border p-6 text-white">
          Are you sure you want to log out?
          <div className="text-[#676767] mt-2 text-sm">
            You can sign in back anytime.
          </div>
          <div className="flex justify-end gap-2 mt-6 text-sm">
            <button
              onClick={() => setLogoutDialog(false)}
              className="ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={async (e) => {
                const auth = getAuth();
                await signOut(auth);
                setLogoutDialog(false);
                router.push("/");
              }}
              style={{ backgroundColor: color, color: textColor }}
              className="ease-in-out hover:brightness-110 py-2 px-6 rounded-xl"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={() => {
            setMobileMenu(!mobileMenu);
          }}
          className={`z-[3000] ${activeFriendPage ? "hidden" : "block"} w-6 h-6 absolute top-3 left-2 text-white md:hidden`}
        >
          <Menu
            className={`${
              mobileMenu ? "rotate-180" : ""
            } text-white ease-in-out duration-200 w-5 h-5`}
          />
        </button>
        <div
          className={`bg-theme-base ${className} md:translate-y-0 translate-y-10 fixed md:static top-0 left-0 md:h-screen h-[calc(100dvh-40px)]
    border-theme-border border-r select-none transition-transform duration-300
    flex flex-col py-2 px-4 md:p-2 text-white items-center font-sans z-[1500]
    ${mobileMenu ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0`}
        >
          {!user?.user_id || !rooms ? (
            <div className="flex flex-col gap-1 mt-2 text-sm items-center">
              <div className="ease-in-out bg-theme-base text-white/90 duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]">
                <Users className="w-4 h-4" />
                <span>Friends</span>
              </div>
              <div className="ease-in-out bg-theme-base text-white/90 duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]">
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </div>
              <div className="ease-in-out bg-theme-base text-white/90 duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]">
                <UserPlus className="w-4 h-4" />
                <span>Join Room</span>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col gap-1 mt-2 text-sm items-center`}>
              <button
                onClick={() => router.push("/portal")}
                className={`${/^\/portal$/.test(pathname) ? "bg-theme-hover" : "bg-theme-base"} ease-in-out text-white/90 hover:bg-theme-hover hover:text-white duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]`}
              >
                <Users className="w-4 h-4" />
                <span>Friends</span>
              </button>
              <button
                onClick={() => setCreateDialog(true)}
                className="ease-in-out bg-theme-base hover:bg-theme-hover text-white/90 hover:text-white duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>

              <button
                onClick={() => setJoinDialog(true)}
                className="ease-in-out bg-theme-base hover:bg-theme-hover text-white/90 hover:text-white duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join Room</span>
              </button>
            </div>
          )}
          {!user?.user_id || !rooms ? (
            showPortalSkeletons ? (
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
            ) : null
          ) : (
            <div className="mt-3">
              <div className="flex gap-36 items-center ml-3 text-[#aaaaaa]">
                <span className="text-xs">Rooms</span>
                <div className="bg-theme-hover rounded-[8px] px-2 py-1 flex text-white/60 text-xs items-center gap-0.5">
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
              setLogoutDialog={setLogoutDialog}
            />
          )}
        </div>
      </div>
    </>
  );
}
