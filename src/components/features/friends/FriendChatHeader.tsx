"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Menu01Icon,
  Moon02Icon,
  Image02Icon,
  CallIcon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { UserProfilePopup } from "@/components/popups/UserProfilePopup";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { UserRemove01Icon } from "@hugeicons/core-free-icons";
import { useUIStore } from "@/store/uiStore";
import { useUserStore } from "@/store/useUserStore";
import { useFriendActions } from "@/hooks";
import type { ConvexFriend } from "@/hooks/useFriends";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { toast } from "sonner";

interface FriendChatHeaderProps {
  friend: ConvexFriend | undefined;
  directConversationId: string;
  onlineUsers: Set<string>;
  awayUsers: Set<string>;
  activeCalls: unknown[];
  isInCall: boolean;
  actualRoomId: string | null;
}

export function FriendChatHeader({
  friend,
  directConversationId,
  onlineUsers,
  awayUsers,
  activeCalls,
  isInCall,
  actualRoomId,
}: FriendChatHeaderProps) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const { removeFriend } = useFriendActions();
  const {
    isSidebarOpen,
    sidebarTab,
    toggleSidebar,
    leftMobileMenu,
    setLeftMobileMenu,
  } = useUIStore();

  const handleRemoveFriend = async () => {
    if (friend?.friend?.user_id) {
      try {
        await removeFriend(friend.friend.user_id);
        toast.success("Friend removed");
        router.push("/portal");
      } catch {
        toast.error("Failed to remove friend");
      }
    }
  };

  const isUserOnline = friend?.friend?.user_id
    ? onlineUsers.has(friend.friend.user_id)
    : false;
  const isUserAway = friend?.friend?.user_id
    ? awayUsers.has(friend.friend.user_id)
    : false;

  return (
    <>
      <div className="flex shrink-0 items-center p-2 h-12 w-full gap-4 border-b border-theme-border bg-theme-hover bg-opacity-100">
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
          side="bottom"
          align="start"
        >
          <div className="relative flex flex-1 items-center gap-3 cursor-pointer group w-fit">
            <div className="relative">
              <Image
                src={friend?.friend?.avatar || "@/assets/defaultAvatar.png"}
                alt="pic"
                width={28}
                height={28}
                unoptimized
                className="w-7 h-7 rounded-[8px]"
              />
              <StatusIndicator isOnline={isUserOnline} isAway={isUserAway} />
            </div>
            <span className="text-white/80 text-sm group-hover:text-white transition-colors">
              {friend?.friend?.username}
            </span>
          </div>
        </UserProfilePopup>
        <div className="flex items-center gap-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar("media");
            }}
            className={`w-7 select-none h-7 cursor-pointer duration-100 ease-in-out rounded-[8px] p-1 flex items-center justify-center transition-colors ${
              isSidebarOpen && sidebarTab === "media"
                ? "bg-theme-base"
                : "hover:bg-theme-base"
            }`}
          >
            <HugeiconsIcon
              icon={Image02Icon}
              className={`w-4 h-4 transition-colors ${
                isSidebarOpen && sidebarTab === "media"
                  ? "text-white"
                  : "text-white/70"
              }`}
            />
          </div>
          <div
            onClick={() => toggleSidebar("calls")}
            className={`w-7 select-none h-7 cursor-pointer duration-100 ease-in-out rounded-[8px] p-1 flex items-center justify-center transition-colors relative ${
              isSidebarOpen && sidebarTab === "calls"
                ? "bg-theme-base"
                : "hover:bg-theme-base"
            }`}
          >
            <HugeiconsIcon
              icon={CallIcon}
              className={`w-4 h-4 transition-colors ${
                isSidebarOpen && sidebarTab === "calls"
                  ? "text-white"
                  : "text-white/70"
              }`}
            />
            {activeCalls.length > 0 && (
              <span
                className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  isInCall && actualRoomId === directConversationId
                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                    : "bg-green-500"
                }`}
              />
            )}
          </div>

          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center">
                <HugeiconsIcon
                  icon={MoreVerticalIcon}
                  className="w-7 h-7 hover:bg-theme-base cursor-pointer duration-100 transition-all ease-in-out rounded-[8px] p-1 text-white/70"
                />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                align="end"
                className="w-auto min-w-[120px] bg-theme-base border border-theme-border rounded-[8px] shadow-xl z-[100] animate-in fade-in duration-100 outline-none"
              >
                <DropdownMenu.Item
                  onClick={handleRemoveFriend}
                  className="px-3 py-2 text-xs text-red-300 hover:bg-theme-hover flex items-center gap-2 cursor-pointer outline-none"
                >
                  <HugeiconsIcon icon={UserRemove01Icon} className="w-4 h-4" />
                  Remove Friend
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </>
  );
}
