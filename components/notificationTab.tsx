"use client";
import { useMemo, useState } from "react";
import { BadgeX, Bell, Hash, MessageCircle } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useNotificationStore } from "@/store/notificationStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "./ui/skeleton";

function formatTimeAgo(createdAt: number) {
  const diffMs = Date.now() - createdAt;
  const diffSeconds = Math.max(1, Math.floor(diffMs / 1000));

  if (diffSeconds < 60) return "Just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}

type ActiveFriendId = ReturnType<
  typeof useUIStore.getState
>["activeFriendPage"];

export default function NotificationTab() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();
  const { activeFriendPage, setActiveFriendPage } = useUIStore();
  const rawNotifications = useNotificationStore((s) => s.notifications);
  const notifications = useMemo(() => rawNotifications, [rawNotifications]);
  const notificationsQuery = useQuery(
    api.chatNotifications.getMessageNotifications,
  );
  const isNotificationsLoading =
    notificationsQuery === undefined && notifications.length === 0;
  const removeNotificationLocal = useNotificationStore(
    (s) => s.removeNotification,
  );
  const clearAllNotificationsLocal = useNotificationStore(
    (s) => s.clearAllNotifications,
  );
  const removeNotification = useMutation(
    api.chatNotifications.removeNotification,
  );
  const clearAllNotifications = useMutation(
    api.chatNotifications.clearAllNotifications,
  );

  return (
    <>
      <button
        onClick={() => setMobileMenu(!mobileMenu)}
        className={`z-[9999] ${activeFriendPage ? "hidden" : "block"} w-6 h-6 absolute top-1.5 right-2 text-white md:hidden`}
      >
        <Bell className="text-white/90 ml-1 w-4 h-4" />
      </button>
      <div
        className={`md:w-[360px] w-[300px] select-none
    transition-transform duration-300 ease-in-out
    h-screen
    fixed top-0 right-0 z-[9000]
    md:translate-y-0 translate-y-9
    ${mobileMenu ? "translate-x-0" : "translate-x-full"}

    md:static md:translate-x-0 border-theme-border border-l bg-theme-base font-sans`}
      >
        <div className="flex justify-between px-2 items-center bg-theme-base border-b border-theme-border py-1 md:py-3">
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
                  await clearAllNotifications({});
                  clearAllNotificationsLocal();
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
          {isNotificationsLoading ? (
            <>
              <Skeleton className="h-[92px] rounded-[14px]" />
              <Skeleton className="h-[92px] rounded-[14px]" />
              <Skeleton className="h-[92px] rounded-[14px]" />
            </>
          ) : notifications.length === 0 ? (
            <div className="mt-8 rounded-[14px] px-4 py-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[12px] border border-theme-border bg-theme-base">
                <Bell className="h-5 w-5 text-white/45" />
              </div>
              <p className="mt-4 text-sm text-white/40">
                No notifications yet
              </p>{" "}
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="group relative rounded-[14px] border border-theme-border bg-theme-surface p-3 shadow-sm"
              >
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const notificationId = String(notification.id);
                      if (
                        notificationId.startsWith("room-") ||
                        notificationId.startsWith("friend-")
                      ) {
                        removeNotificationLocal(notification.id);
                        return;
                      }
                      await removeNotification({
                        notification_id: notification.id,
                      });
                      removeNotificationLocal(notification.id);
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                  className="absolute -top-0 right-0 z-[60] flex h-4 w-4 items-center justify-center rounded-full border border-white/5 opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:scale-110 group-hover:opacity-100"
                  aria-label="Clear notification"
                >
                  <BadgeX className="h-4 w-4 text-white/50" />
                </button>
                <div className="group flex items-start gap-3">
                  <button
                    onClick={() => {
                      if (notification.sourceType === "friend") {
                        setActiveFriendPage(
                          notification.sourceId as ActiveFriendId,
                        );
                        router.push("/portal");
                      } else {
                        router.push(`/portal/room/${notification.sourceId}`);
                      }
                      setMobileMenu(false);
                    }}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-theme-border bg-theme-base">
                      {notification.senderAvatar ? (
                        <Image
                          src={notification.senderAvatar}
                          alt={notification.senderName}
                          width={44}
                          height={44}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Bell className="h-4 w-4 text-white/45" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-3">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-white/90">
                          {notification.senderName}
                        </p>
                        <div className="ml-auto pr-1 flex flex-shrink-0 items-center gap-1.5 text-xs text-white/55">
                          {notification.sourceType === "room" ? (
                            <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                          ) : (
                            <MessageCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          )}
                          <span className="max-w-[130px] truncate text-sm text-white/75">
                            {notification.sourceName}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-start gap-3">
                        <p className="line-clamp-2 min-w-0 flex-1 text-sm text-white/60">
                          {notification.message}
                        </p>
                        <p className="ml-auto pr-1 flex-shrink-0 pt-0.5 text-xs text-white/35">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
