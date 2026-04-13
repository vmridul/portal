"use client";
import { useState } from "react";
import { BadgeX, Bell, Hash } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useNotifications, useNotificationActions } from "@/src/hooks";
import { Skeleton } from "./ui/skeleton";
import { timeAgo } from "@/lib/utils/date";

type ActiveFriendId = ReturnType<
  typeof useUIStore.getState
>["activeFriendPage"];

export default function NotificationTab() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();
  const { activeFriendPage, setActiveFriendPage } = useUIStore();
  const {
    notifications,
    isLoading: isNotificationsLoading,
  } = useNotifications();
  const {
    removeNotification: removeNotificationAction,
    clearAllNotifications: clearAllNotificationsAction,
  } = useNotificationActions();

  const isLoading = isNotificationsLoading && notifications.length === 0;

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

    md:static md:translate-x-0 border-theme-border border-l bg-theme-base font-sans`}
      >
        <div className="flex justify-between px-2 items-center bg-theme-base border-b border-theme-border py-1 h-12">
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
            <div className="rounded-[14px] mt-[82%] text-center">
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
                className="group relative rounded-[14px] bg-theme-surface p-3 shadow-sm"
              >
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await removeNotificationAction(notification.id);
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