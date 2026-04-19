"use client";
import { useState } from "react";
import { XCircle as BadgeX, Bell, Hash } from "@phosphor-icons/react";
import { useUIStore } from "@/store/uiStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useNotifications, useNotificationActions, useFriends, useCallSessionActions } from "@/hooks";
import { useRooms } from "@/contexts/roomContext";
import { Skeleton } from "@/components/shared/skeletons/Skeleton";
import { timeAgo } from "@/lib/utils/date";
import { useUserStore } from "@/store/useUserStore";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AvatarStack from "@/components/shared/AvatarStack";

type ActiveFriendId = ReturnType<
  typeof useUIStore.getState
>["activeFriendPage"];

type NotificationItem = ReturnType<typeof useNotifications>["notifications"][number];

function NotificationCard({
  notification,
  isUnread,
  onOpen,
  onJoin,
  onRemove,
}: {
  notification: NotificationItem;
  isUnread: boolean;
  onOpen: () => void;
  onJoin: () => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const participantProfiles =
    useQuery(
      api.users.getUsersByExternalIds,
      notification.notificationType === "call" && notification.participantIds.length > 0
        ? { user_ids: notification.participantIds }
        : "skip",
    ) || [];

  const isEndedCall =
    notification.notificationType === "call" &&
    notification.callStatus === "ended";

  return (
    <div
      className={`group relative rounded-[14px] p-3 shadow-sm ${
        isUnread ? "bg-theme-hover" : "bg-theme-base"
      }`}
    >
      <button
        onClick={async (e) => {
          e.stopPropagation();
          await onRemove();
        }}
        className="absolute -top-0 right-0 z-[60] flex h-4 w-4 items-center justify-center rounded-full border border-white/5 opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:scale-110 group-hover:opacity-100"
        aria-label="Clear notification"
      >
        <BadgeX className="h-4 w-4 text-white/50" />
      </button>

      {isEndedCall ? (
        <button onClick={onOpen} className="w-full text-left">
          <div className="text-sm font-medium text-white/90">Call ended</div>
          <div className="mt-3">
            <AvatarStack users={participantProfiles} size={26} limit={5} />
          </div>
          <p className="mt-2 text-xs text-white/35">
            {timeAgo(notification.createdAt)}
          </p>
        </button>
      ) : (
        <div className="group flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-theme-border bg-theme-base">
            {notification.senderAvatar ? (
              <Image
                src={notification.senderAvatar}
                alt={notification.senderName}
                width={12}
                height={12}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <Bell className="h-4 w-4 text-white/45" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <button onClick={onOpen} className="w-full text-left">
              <div className="flex min-w-0 items-center gap-3">
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-white/90">
                  {notification.senderName}
                </p>
                {notification.sourceType === "room" && (
                  <div className="ml-auto pr-1 flex flex-shrink-0 items-center gap-1.5 text-xs text-white/55">
                    <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="max-w-[130px] truncate text-sm text-white/75">
                      {notification.sourceName}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-1 flex items-start gap-3">
                <p className="line-clamp-2 min-w-0 flex-1 text-sm text-white/60">
                  {notification.message}
                </p>
                <p className="ml-auto pr-1 flex-shrink-0 pt-0.5 text-xs text-white/35">
                  {timeAgo(notification.createdAt)}
                </p>
              </div>
            </button>
            {notification.notificationType === "call" &&
              notification.callStatus === "active" && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onJoin();
                    }}
                    className="rounded-[10px] bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                  >
                    Join
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NotificationTab() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();
  const { activeFriendPage, setActiveFriendPage, setSidebarOpen, setSidebarTab } = useUIStore();
  const {
    notifications,
    isLoading: isNotificationsLoading,
  } = useNotifications();
  const {
    removeNotification: removeNotificationAction,
    clearAllNotifications: clearAllNotificationsAction,
  } = useNotificationActions();
  const { rooms } = useRooms();
  const { friends } = useFriends();
  const { joinOrSwitchSession } = useCallSessionActions();
  const user = useUserStore((state) => state.user);

  const isLoading = isNotificationsLoading && notifications.length === 0;

  const openNotification = async (notification: (typeof notifications)[number]) => {
    if (notification.sourceType === 'direct') {
      setActiveFriendPage(
        notification.sourceId as ActiveFriendId,
      );
      router.push('/portal');
    } else {
      router.push(`/portal/room/${notification.sourceId}`);
    }
    if (notification.notificationType === "call") {
      setSidebarOpen(true);
      setSidebarTab("calls");
    }
    setMobileMenu(false);
  };

  const joinNotificationCall = async (notification: (typeof notifications)[number]) => {
    if (!notification.callId || notification.callStatus !== "active" || !user) {
      return;
    }

    await openNotification(notification);
    await joinOrSwitchSession({
      callId: notification.callId,
      room: {
        id: notification.conversationId,
        name: notification.sourceName,
      },
      user: {
        userId: user.user_id,
        displayName: user.username || "Guest",
        avatarUrl: user.avatar || undefined,
      },
    });
  };

  return (
    <>
      <button
        onClick={() => setMobileMenu(!mobileMenu)}
        className={`z-[9999] ${activeFriendPage ? "hidden" : "block"} w-6 h-6 absolute top-3 right-2 text-white md:hidden`}
      >
        <Bell className="text-white/90 ml-1 w-4 h-4" />
      </button>
      <div
        className={`md:w-[360px] w-[300px] select-none
    transition-transform duration-300 ease-in-out
    h-screen
    fixed top-0 right-0 z-[9000]
    md:translate-y-0 translate-y-12
    ${mobileMenu ? "translate-x-0" : "translate-x-full"}

    md:static md:translate-x-0 border-theme-border border-l bg-theme-surface`}
      >
        <div className="flex justify-between px-2 items-center bg-theme-surface border-b border-theme-border py-1 h-12">
          <div className="ml-3 md:flex hidden items-center gap-2 text-white/90">
            <Bell className="w-4 h-4" />
            <h1 className="text-md">Notifications</h1>
          </div>
          <div className="ml-3 md:hidden flex items-center gap-2 text-white/90">
            <h1 className="text-md font-semibold mt-1">Notifications</h1>
          </div>

          <div className="flex items-center text-sm gap-1">
            <button
              onClick={async () => {
                try {
                  await clearAllNotificationsAction();
                } catch (error) {
                  console.error(error);
                }
              }}
              className={`${notifications.length > 0 ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} flex items-center gap-2 h-[28px] hover:bg-theme-hover text-white/90 px-3 py-1 rounded-[8px]`}
            >
              <span className="text-xs text-white/70">Clear</span>
            </button>
          </div>
        </div>

        <div className="mt-2 flex h-[calc(100vh-72px)] flex-col gap-1 overflow-y-auto px-2">
          {isLoading ? (
            <>
              <Skeleton className="h-[92px] rounded-[14px]" />
              <Skeleton className="h-[92px] rounded-[14px]" />
              <Skeleton className="h-[92px] rounded-[14px]" />
            </>
          ) : notifications.length === 0 ? (
            <div className="rounded-[14px] text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[12px] border border-theme-border bg-theme-base">
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-4 text-xs text-gray-400">
                No notifications yet
              </p>{" "}
            </div>
          ) : (
            notifications.map((notification) => {
              const lastReadTime =
                notification.sourceType === "direct"
                  ? friends.find((f) => f.friend.user_id === notification.sourceId)
                    ?.last_read_time
                  : rooms.find((r) => r.room_id === notification.sourceId)
                    ?.last_read_time;

              const isUnread = notification.createdAt > (lastReadTime ?? 0);

              return (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  isUnread={isUnread}
                  onOpen={() => {
                    void openNotification(notification);
                  }}
                  onJoin={() => joinNotificationCall(notification)}
                  onRemove={async () => {
                    try {
                      await removeNotificationAction(notification.id);
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
