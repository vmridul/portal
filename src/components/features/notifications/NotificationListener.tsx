"use client";

import { useNotifications, useNotificationActions } from "@/hooks";
import { useNotificationHandlers } from "./useNotificationHandlers";
import { useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { NotificationToast } from "./NotificationToast";

/**
 * NotificationListener handles incoming real-time notifications by showing toasts
 * and ensuring they are marked as seen on the backend.
 */
export default function NotificationListener() {
  const { notifications: convexNotifications } = useNotifications();
  const { markAsShown } = useNotificationActions();

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

  const { openNotification, joinNotificationCall } = useNotificationHandlers();

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
      initialSnapshot.current = new Set(notifications.map((item) => item.id));
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
          <NotificationToast
            item={item}
            onDismissAndNavigate={() => {
              toast.dismiss(item.id);
              openNotification(item);
            }}
            onJoinCall={async (e) => {
              e.stopPropagation();
              toast.dismiss(item.id);
              await joinNotificationCall(item);
            }}
          />
        ),
        {
          id: item.id,
          duration: 5000,
        },
      );
    });
  }, [
    notifications,
    convexNotifications,
    markAsShown,
    openNotification,
    joinNotificationCall,
  ]);

  return null;
}
