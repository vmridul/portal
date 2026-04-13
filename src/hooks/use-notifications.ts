"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback } from "react";
import type { Id } from "@/convex/_generated/dataModel";

export function useNotifications() {
  const notificationsQuery = useQuery(api.chatNotifications.getMessageNotifications);

  return {
    notifications: notificationsQuery ?? [],
    isLoading: notificationsQuery === undefined,
  };
}

interface UseNotificationActionsResult {
  removeNotification: (notificationId: Id<"chatNotifications">) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  markAsShown: (notificationId: Id<"chatNotifications">) => Promise<void>;
}

export function useNotificationActions(): UseNotificationActionsResult {
  const removeNotificationMutation = useMutation(api.chatNotifications.removeNotification);
  const clearAllNotificationsMutation = useMutation(api.chatNotifications.clearAllNotifications);
  const markToastShownMutation = useMutation(api.chatNotifications.markToastShown);

  const removeNotification = useCallback(
    async (notificationId: Id<"chatNotifications">) => {
      await removeNotificationMutation({ notification_id: notificationId });
    },
    [removeNotificationMutation]
  );

  const clearAllNotifications = useCallback(
    async () => {
      await clearAllNotificationsMutation({});
    },
    [clearAllNotificationsMutation]
  );

  const markAsShown = useCallback(
    async (notificationId: Id<"chatNotifications">) => {
      await markToastShownMutation({ notification_id: notificationId });
    },
    [markToastShownMutation]
  );

  return {
    removeNotification,
    clearAllNotifications,
    markAsShown,
  };
}