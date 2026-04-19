"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  MoreVerticalIcon,
  Menu01Icon,
  Moon02Icon,
  Image02Icon,
  CallIcon,
  UserRemove01Icon
} from "@hugeicons/core-free-icons";
import LeftSidebar from "@/components/layout/LeftSidebar";
import ActiveFriendPage from "@/components/features/friends/ActiveFriendPage";
import NotificationTab from "@/components/features/notifications/NotificationTab";
import { ChatSkeleton } from "@/components/shared/skeletons/ChatSkeleton";
import { useUIStore } from "@/store/uiStore";
import { useUserStore } from "@/store/useUserStore";
import { useFriends, useCalls, useFriendActions } from "@/hooks";
import { useOutsideClick } from "@/hooks/ui/useOutsideClick";
import { usePresence } from "@/contexts/presenceContext";
import { getDirectConversationId } from "@/lib/utils/message";
import { useCallStore } from "@/store/callStore";
import { UserProfilePopup } from "@/components/shared/UserProfilePopup";
import { DetailsSidebar } from "@/components/shared/DetailsSidebar";
import Image from "next/image";

function FriendPageContent() {
  const params = useParams();
  const router = useRouter();
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const [checking, setChecking] = useState(true);

  const {
    menuOpen,
    setMenuOpen,
    isSidebarOpen,
    sidebarTab,
    toggleSidebar,
    leftMobileMenu,
    setLeftMobileMenu,
  } = useUIStore();
  const user = useUserStore((s) => s.user);
  const { onlineUsers, awayUsers } = usePresence();
  const { friends, isLoading: isLoadingFriends } = useFriends();
  const { removeFriend } = useFriendActions();

  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(menuRef, () => {
    setMenuOpen(false);
  });

  const friendId = params.friend_id as string;
  const friend = friends.find(
    (f) => f?.friend?.user_id === friendId
  );
  const isFriend = !!friend;

  const directConversationId = friendId && user?.user_id
    ? getDirectConversationId(friendId, user.user_id)
    : "";
  const { activeCalls } = useCalls(directConversationId);
  const { isJoined: isInCall, actualRoomId } = useCallStore();

  useEffect(() => {
    if (!isAuthLoaded) return;

    if (!userId) {
      router.replace(`/`);
      return;
    }

    if (friendId && friendId.length > 0) {
      if (isLoadingFriends) return;

      if (!isFriend) {
        router.replace("/portal");
        return;
      }
      setChecking(false);
    } else {
      router.replace("/portal");
    }
  }, [friendId, router, userId, isAuthLoaded, isFriend, isLoadingFriends]);

  const handleRemoveFriend = async () => {
    if (friendId) {
      await removeFriend(friendId);
      router.push("/portal");
    }
  };

  return (
    <>
      <div
        ref={menuRef}
        className={`
    fixed z-[9999] md:right-[224px] right-4 md:top-[16px] top-[35px] text-white/90 font-sans flex flex-col overflow-hidden items-start
    max-w-[140px]
    h-auto
    rounded-[8px] bg-theme-surface border border-theme-border
    shadow-lg text-xs
    transform transition-all duration-150
 ease-out
    ${menuOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-1 pointer-events-none"
          }
  `}
      >
        <div
          onClick={async () => {
            await handleRemoveFriend();
            setMenuOpen(false);
          }}
          className="flex items-center cursor-pointer hover:bg-theme-hover text-red-200"
        >
          <HugeiconsIcon icon={UserRemove01Icon} className="w-4 h-4 ml-3 mr-2" />
          <button className="w-32 text-start py-2">Remove Friend</button>
        </div>
      </div>
      <div className="flex h-[100dvh] overflow-hidden text-white">
        <LeftSidebar className="w-64" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex shrink-0 items-center p-3 w-full gap-4 border-b border-theme-border bg-theme-hover bg-opacity-100">
            <HugeiconsIcon
              icon={Menu01Icon}
              onClick={() => setLeftMobileMenu(!leftMobileMenu)}
              className="w-7 h-7 hover:bg-theme-base cursor-pointer duration-100 transition-all ease-in-out rounded-[8px] p-1 text-white/70 md:hidden"
            />
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              onClick={() => router.push("/portal")}
              className="w-7 h-7 hover:bg-theme-base cursor-pointer duration-100 transition-all ease-in-out rounded-[8px] p-1 text-white/70"
            />
            <div className="relative flex flex-1 items-center gap-3">
              <Image
                src={friend?.friend?.avatar || "@/assets/defaultAvatar.png"}
                alt="pic"
                width={28}
                height={28}
                unoptimized
                className="w-7 h-7 rounded-[8px]"
              />
              {friend?.friend?.user_id && onlineUsers.has(friend.friend.user_id) ? (
                <div className="absolute bottom-0 left-5 h-2 w-2 bg-green-500 border border-[#59ab44] rounded-full"></div>
              ) : friend?.friend?.user_id && awayUsers.has(friend.friend.user_id) ? (
                <HugeiconsIcon
                  icon={Moon02Icon}
                  fill="currentColor"
                  className="absolute text-yellow-400 left-5 bottom-0 w-[10px] h-[10px] opacity-90"
                />
              ) : (
                <div className="absolute bottom-0 left-5 h-2 w-2 bg-gray-500 border border-[#858585] rounded-full"></div>
              )}
              <UserProfilePopup
                user={{
                  id: friend?.friend?.user_id || "",
                  username: friend?.friend?.username || "",
                  avatarUrl: friend?.friend?.avatar,
                  joinedAt: friend?._creationTime
                    ? new Date(friend._creationTime).toISOString()
                    : new Date().toISOString(),
                }}
                currentUserId={user?.user_id}
              >
                <span className="text-white/80 text-sm hover:text-white cursor-pointer transition-colors">
                  {friend?.friend?.username}
                </span>
              </UserProfilePopup>
            </div>
            <div className="flex items-center gap-2">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSidebar("media");
                }}
                className={`w-7 select-none h-7 cursor-pointer duration-100  ease-in-out rounded-[8px] p-1 flex items-center justify-center transition-colors ${isSidebarOpen && sidebarTab === "media" ? "bg-theme-base" : "hover:bg-theme-base"
                  }`}
              >
                <HugeiconsIcon icon={Image02Icon} className={`w-4 h-4 transition-colors ${isSidebarOpen && sidebarTab === "media" ? "text-white" : "text-white/70"}`} />
              </div>
              <div
                onClick={() => {
                  toggleSidebar("calls");
                }}
                className={`w-7 select-none h-7 cursor-pointer duration-100 ease-in-out rounded-[8px] p-1 flex items-center justify-center transition-colors relative ${isSidebarOpen && sidebarTab === "calls"
                  ? "bg-theme-base"
                  : "hover:bg-theme-base"
                  }`}
              >
                <HugeiconsIcon
                  icon={CallIcon}
                  className={`w-4 h-4 transition-colors ${isSidebarOpen && sidebarTab === "calls"
                    ? "text-white"
                    : "text-white/70"
                    }`}
                />
                {activeCalls.length > 0 && (
                  <span
                    className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isInCall && actualRoomId === directConversationId
                      ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                      : "bg-green-500"
                      }`}
                  />
                )}
              </div>

              <div
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center"
              >
                <HugeiconsIcon icon={MoreVerticalIcon} className="w-7 h-7 hover:bg-theme-base cursor-pointer duration-100 transition-all ease-in-out rounded-[8px] p-1 text-white/70" />
              </div>
            </div>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-hidden relative">
              <Suspense fallback={<ChatSkeleton />}>
                <ActiveFriendPage />
              </Suspense>
            </div>
            {isSidebarOpen && (
              <div className="flex-none transition-all duration-300 ease-in-out">
                <DetailsSidebar
                  id={directConversationId}
                  type="direct"
                  title={friend?.friend?.username || "Direct Message"}
                />
              </div>
            )}
          </div>
        </div>
        <NotificationTab />
      </div>
    </>
  );
}

export default function Page() {
  return <FriendPageContent />;
}