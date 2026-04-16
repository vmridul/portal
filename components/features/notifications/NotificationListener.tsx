"use client";

import { useUIStore } from "@/store/uiStore";
import { useNotifications, useNotificationActions } from "@/hooks";
import { Bell, Hash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";

type ActiveFriendId = ReturnType<
  typeof useUIStore.getState
>["activeFriendPage"];

/**
 * NotificationListener handles incoming real-time notifications by showing toasts
 * and ensuring they are marked as seen on the backend.
 */
export default function NotificationListener() {
  const router = useRouter();
  const { setActiveFriendPage } = useUIStore();
  const { notifications: convexNotifications } = useNotifications();
  const { markAsShown } = useNotificationActions();

  // Production-level session tracking:
  // 1. Capture the exact millisecond the application/component mounted.
  //    This allows us to distinguish between historical notifications (missed while offline)
  //    and real-time notifications (arrived while the app is active).
  const sessionStartTime = useRef(Date.now());

  // 2. Track IDs processed in this current lifecycle to prevent duplicate toasts
  //    during rapid state updates or re-renders before the backend confirms 'markAsShown'.
  const processedIds = useRef(new Set<string>());

  const notifications = useMemo(
    () => convexNotifications || [],
    [convexNotifications],
  );

  const handleNotificationClick = useCallback((item: (typeof notifications)[0]) => {
    if (item.sourceType === "direct") {
      setActiveFriendPage(item.sourceId as ActiveFriendId);
      router.push("/portal");
    } else {
      router.push(`/portal/room/${item.sourceId}`);
    }
  }, [router, setActiveFriendPage]);

  useEffect(() => {
    // Wait for the initial query to load
    if (convexNotifications === undefined) {
      return;
    }

    notifications.forEach((item) => {
      // Logic for triggering toasts:
      // 1. Must be marked as 'shouldShowToast' by the backend
      if (!item.shouldShowToast) return;

      // 2. Must not have been already processed by this component instance
      if (processedIds.current.has(item.id)) return;

      // Optimistically mark as processed locally
      processedIds.current.add(item.id);

      // 3. Inform the backend that we've seen this notification
      // We do this for BOTH historical and real-time notifications to 'consume' them.
      markAsShown(item.id).catch((err) => {
        console.error("[NotificationListener] Failed to mark as shown:", err);
        // Note: We don't remove from processedIds here to avoid toast spam if the mutation fails.
      });

      // 4. Verify if it's a real-time event
      // If the notification was created BEFORE we mounted, it's historical.
      // We skip the toast for historical messages as per user requirement.
      const isHistorical = item.createdAt <= sessionStartTime.current;
      if (isHistorical) {
        return;
      }

      // 5. Show the toast with a 4-second duration
      toast.custom(
        () => (
          <button
            onClick={() => {
              toast.dismiss(item.id);
              handleNotificationClick(item);
            }}
            className="w-[min(72vw,350px)] rounded-[12px] border border-theme-border bg-theme-surface px-4 py-3 text-left text-white shadow-2xl transition-all hover:border-theme-border-hover/50 active:scale-[0.98]"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-theme-border bg-theme-base">
                {item.senderAvatar ? (
                  <Image
                    src={item.senderAvatar}
                    alt={item.senderName}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Bell className="h-4 w-4 text-white/65" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-white/90">
                    {item.senderName}
                  </p>
                  {item.sourceType === "room" && (
                    <div className="ml-auto flex flex-shrink-0 items-center gap-1.5 text-xs text-white/55">
                      <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="max-w-[140px] truncate text-sm text-white/75">
                        {item.sourceName}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-white/65">
                  {item.message}
                </p>
              </div>
            </div>
          </button>
        ),
        {
          id: item.id,
          duration: 4000,
        },
      );
    });
  }, [notifications, convexNotifications, markAsShown, handleNotificationClick]);

  return null;
}