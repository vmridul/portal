"use client";

import { useNotifications, useNotificationActions } from "@/hooks";
import { useNotificationHandlers } from "./useNotificationHandlers";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { NotificationToast } from "./NotificationToast";
import { useNewNotifications } from "@/hooks/useNewNotifications";
import { useActiveConversationId } from "@/hooks/useActiveConversationId";

/**
 * NotificationListener handles incoming real-time notifications by showing toasts
 * and ensuring they are marked as read on the backend.
 */
export default function NotificationListener() {
  const { notifications: convexNotifications } = useNotifications();
  const { markAsRead } = useNotificationActions();
  const { updatePreviousIds, getNewNotifications } = useNewNotifications();
  const activeConversationId = useActiveConversationId();
  
  const notifications = useMemo(
    () => convexNotifications || [],
    [convexNotifications]
  );

  const { openNotification, joinNotificationCall } = useNotificationHandlers();

  useEffect(() => {
    if (convexNotifications === undefined) {
      return;
    }

    // Process notifications to show toasts for new ones
    const notificationIds = notifications.map(n => n.id);
    const newNotificationIds = getNewNotifications(notificationIds);
    
    // Mark all current notifications as "seen" to prevent duplicate toasts
    updatePreviousIds(notificationIds);
    
    // Show toasts for any new notifications that aren't historical
    if (newNotificationIds.length > 0) {
      newNotificationIds.forEach((id) => {
        // Find the full notification object
        const notification = notifications.find(n => n.id === id);
        if (!notification) return;
        
        // Don't show toasts if:
        // 1. User is not viewing the conversation that the notification is from
        // 2. User is in the app (tab is focused)
        if (document.visibilityState !== "visible" || document.hidden) {
          return;
        }
        
        // Don't show toast if user is currently viewing the conversation
        if (activeConversationId && activeConversationId === notification.conversationId) {
          return;
        }
        
        // Show the toast
        toast.custom(
          () => (
            <NotificationToast
              item={notification}
              onDismissAndNavigate={() => {
                toast.dismiss(notification.id);
                openNotification(notification);
              }}
              onJoinCall={async (e) => {
                e.stopPropagation();
                toast.dismiss(notification.id);
                await joinNotificationCall(notification);
              }}
            />
          ),
          {
            id: notification.id,
            duration: 5000,
          }
        );
        
        // Mark as read in the sidebar
        markAsRead(notification.id).catch((err) => {
          console.error("[NotificationListener] Failed to mark as read:", err);
        });
      });
    }
  }, [
    notifications,
    convexNotifications,
    markAsRead,
    openNotification,
    joinNotificationCall,
    activeConversationId,
    updatePreviousIds,
    getNewNotifications
  ]);

  return null;
}
