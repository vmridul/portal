"use client";
import { useEffect, useState } from "react";
import { UserPlus, Plus, Menu, HouseIcon, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/shared/skeletons/Skeleton";
import { useRooms } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { getAuth, signOut } from "firebase/auth";
import { RoomsList } from "@/components/features/rooms/RoomsList";
import { useRoomActions } from "@/hooks";
import { toast } from "sonner";
import { generateRoomCode } from "@/app/actions/randomID";
import { usePresence } from "@/contexts/presenceContext";
import { ProfileUI } from "@/components/features/profile/ProfileUI";
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
  const currentRoom = pathname.match(/\/portal\/room\/([^/]+)/)?.[1] || null;
  const { rooms, isLoading: isRoomsLoading } = useRooms();
  const user = useUserStore((s) => s.user);
  const { color, textColor } = useColor();
  const [mobileMenu, setMobileMenu] = useState(false);
  const { awayUsers, setStatus } = usePresence();
  const {
    activeFriendPage,
    setModal,
  } = useUIStore();
  const { joinRoom, createRoom } = useRoomActions();





  //open join dialog when path name have search params: join
  useEffect(() => {
    if (joinParam) {
      setModal("JOIN_ROOM");
      router.replace(pathname);
    }
  }, [joinParam, pathname, router, setModal]);

  return (
    <>
      <div>
        <button
          onClick={() => {
            setMobileMenu(!mobileMenu);
          }}
          className={`z-[3000] ${activeFriendPage ? "hidden" : "block"} w-6 h-6 absolute top-3 left-2 text-white md:hidden`}
        >
          <Menu
            className={`${mobileMenu ? "rotate-180" : ""
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
                onClick={() => setModal("CREATE_ROOM")}
                className="ease-in-out bg-theme-base hover:bg-theme-hover text-white/90 hover:text-white duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>

              <button
                onClick={() => setModal("JOIN_ROOM")}
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
              <RoomsList
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
            />
          )}
        </div>
      </div>
    </>
  );
}
