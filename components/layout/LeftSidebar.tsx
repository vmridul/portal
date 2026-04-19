"use client";
import { useEffect } from "react";
import { UserPlus, Plus, HouseIcon, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/shared/skeletons/Skeleton";
import { useRooms } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { RoomsList } from "@/components/features/rooms/RoomsList";
import { usePresence } from "@/contexts/presenceContext";
import { ProfileUI } from "@/components/features/profile/ProfileUI";
import { useUIStore } from "@/store/uiStore";
import PersistentCallWidget from "@/components/features/calls/PersistentCallWidget";


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
  const { rooms } = useRooms();
  const user = useUserStore((s) => s.user);
  const { awayUsers } = usePresence();
  const {
    setModal,
    leftMobileMenu,
    setLeftMobileMenu,
  } = useUIStore();

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
        <div
          className={`bg-theme-surface ${className} md:translate-y-0 translate-y-10 fixed md:static top-0 left-0 md:h-screen h-[calc(100dvh-40px)]
    border-theme-border border-r select-none transition-transform duration-300
    flex flex-col py-2 px-1 md:px-1 text-white items-center font-sans z-[1500]
    ${leftMobileMenu ? "translate-x-0" : "-translate-x-full"}
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
                className={`${/^\/portal$/.test(pathname) ? "bg-theme-hover text-white" : "bg-theme-surface text-gray-200"} ease-in-out  hover:bg-theme-hover hover:text-white duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]`}
              >
                <Users className="w-4 h-4" />
                <span>Friends</span>
              </button>
              <button
                onClick={() => setModal("CREATE_ROOM")}
                className="ease-in-out bg-theme-surface hover:bg-theme-hover text-gray-200 hover:text-white duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>

              <button
                onClick={() => setModal("JOIN_ROOM")}
                className="ease-in-out bg-theme-surface hover:bg-theme-hover text-gray-200 hover:text-white duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]"
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
            <div className="mt-3 flex-1 flex flex-col min-h-0 w-full overflow-hidden">
              <div className="flex justify-between items-center px-3 text-[#aaaaaa] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Rooms</span>
                <div className="bg-theme-hover rounded-[6px] px-2 py-0.5 flex text-white/60 text-[10px] items-center gap-1 border border-theme-border/50">
                  <HouseIcon className="w-3 h-3" />
                  {rooms.length ?? 0}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <RoomsList
                  router={router}
                  setMobileMenu={setLeftMobileMenu}
                  currentRoom={currentRoom}
                />
              </div>
            </div>
          )}

          <div className="mt-auto w-full flex flex-col gap-2 p-1 bg-theme-surface/50">
            {!user?.username || !user?.user_id || !user?.avatar ? (
              <Skeleton className="h-16 w-full rounded-[12px]" />
            ) : (
              <>
                <PersistentCallWidget />
                <ProfileUI
                  user={user}
                  awayUsers={awayUsers}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
