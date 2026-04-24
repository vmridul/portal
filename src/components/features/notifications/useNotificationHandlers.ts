"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { useCallSessionActions } from "@/hooks"; // assuming exported from hooks index
import { useUserStore } from "@/store/useUserStore";
import { useNotifications } from "@/hooks"; // for type

type NotificationItem = ReturnType<typeof useNotifications>['notifications'][number];

export function useNotificationHandlers() {
  const router = useRouter();
  const { setSidebarOpen, setSidebarTab } = useUIStore();
  const { joinOrSwitchSession } = useCallSessionActions();
  const user = useUserStore((state) => state.user);

  const openNotification = useCallback(
    async (notification: NotificationItem, onAfterOpen?: () => void) => {
      if (notification.sourceType === "direct") {
        router.push(`/portal/friend/${notification.sourceId}`);
      } else {
        router.push(`/portal/room/${notification.sourceId}`);
      }
if (notification.notificationType === "call") {
    setSidebarOpen(true);
    setSidebarTab("calls");
  }
      if (onAfterOpen) onAfterOpen();
    },
    [router, setSidebarOpen, setSidebarTab]
  );

  const joinNotificationCall = useCallback(
    async (notification: NotificationItem) => {
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
    },
    [openNotification, joinOrSwitchSession, user]
  );

  return { openNotification, joinNotificationCall } as const;
}
