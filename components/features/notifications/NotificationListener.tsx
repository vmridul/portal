"use client";

import { useUIStore } from "@/store/uiStore";
import { useNotifications, useNotificationActions, useCallSessionActions } from "@/hooks";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon, HashtagIcon, CallIcon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

type ActiveFriendId = ReturnType<
  typeof useUIStore.getState
>["activeFriendPage"];

/**
 * NotificationListener handles incoming real-time notifications by showing toasts
 * and ensuring they are marked as seen on the backend.
 */
export default function NotificationListener() {
  const router = useRouter();
  const { setActiveFriendPage, setSidebarOpen, setSidebarTab } = useUIStore();
  const { notifications: convexNotifications } = useNotifications();
  const { markAsShown } = useNotificationActions();
  const { joinOrSwitchSession } = useCallSessionActions();
  const user = useUserStore((state) => state.user);

  // Production-level session tracking:
  // 1. Snapshot tracking to reliably distinguish historical vs real-time
  const initialSnapshot = useRef<Set<string> | null>(null);

  // 2. Track IDs processed in this current lifecycle to prevent duplicate toasts
  const processedIds = useRef(new Set<string>());

  // 3. Track if we've captured initial snapshot
  const hasCapturedInitialSnapshot = useRef(false);

  // 4. Track when user came online
  const cameOnlineAt = useRef<number>(0);

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
    if (item.notificationType === "call") {
      setSidebarOpen(true);
      setSidebarTab("calls");
    }
  }, [router, setActiveFriendPage, setSidebarOpen, setSidebarTab]);

  const handleJoinCall = useCallback(async (item: (typeof notifications)[0]) => {
    if (!item.callId || item.callStatus !== "active" || !user) {
      return;
    }

    handleNotificationClick(item);
    await joinOrSwitchSession({
      callId: item.callId,
      room: {
        id: item.conversationId,
        name: item.sourceName,
      },
      user: {
        userId: user.user_id,
        displayName: user.username || "Guest",
        avatarUrl: user.avatar || undefined,
      },
    });
  }, [handleNotificationClick, joinOrSwitchSession, user]);

  useEffect(() => {
    if (convexNotifications === undefined) {
      return;
    }

    // Only show toasts when user is online
    if (!navigator.onLine) {
      return;
    }

    // Capture initial snapshot on first run to mark all existing notifications as historical
    if (!hasCapturedInitialSnapshot.current) {
      hasCapturedInitialSnapshot.current = true;
      initialSnapshot.current = new Set(notifications.map(item => item.id));
      cameOnlineAt.current = Date.now();
      return;
    }

    notifications.forEach((item) => {
      // Logic for triggering toasts:
      // 1. Must be marked as 'shouldShowToast' by the backend
      if (!item.shouldShowToast) return;

      // 2. Only show toasts for notifications created after we came online
      if (item.createdAt < cameOnlineAt.current) {
        return;
      }

      // 3. Must not have been already processed by this component instance
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
      // If the notification was present in our initial snapshot, skip the toast.
      const isHistorical = initialSnapshot.current?.has(item.id);
      if (isHistorical) {
        return;
      }

      // 5. Show the toast with a 4-second duration
      toast.custom(
        () => (
          <div onClick={() => {
            toast.dismiss(item.id);
            handleNotificationClick(item);
          }} className="cursor-pointer w-[min(72vw,380px)] rounded-[12px] border border-theme-border bg-theme-surface px-4 py-3 text-white shadow-2xl">
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
                  <HugeiconsIcon icon={Notification01Icon} className="h-4 w-4 text-white/65" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-white/90">
                    {item.senderName}
                  </p>
                  {item.sourceType === "room" && (
                    <div className="ml-auto flex flex-shrink-0 items-center gap-1.5 text-xs text-white/55">
                      <HugeiconsIcon icon={HashtagIcon} className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="max-w-[140px] truncate text-sm text-white/75">
                        {item.sourceName}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-white/65">
                  {item.message}
                </p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  {item.notificationType === "call" && item.callStatus === "active" && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        toast.dismiss(item.id);
                        await handleJoinCall(item);
                      }}
                      className="rounded-[10px] bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ),
        {
          id: item.id,
          duration: 5000,
        },
      );
    });
  }, [notifications, convexNotifications, markAsShown, handleNotificationClick, handleJoinCall]);

  return null;
}
