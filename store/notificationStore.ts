import { create } from "zustand";
import type { Id } from "@/convex/_generated/dataModel";
import { persist } from "zustand/middleware";

export type NotificationItem = {
  id: Id<"chatNotifications">;
  messageId: string;
  sourceType: "room" | "friend";
  sourceId: string;
  sourceName: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  createdAt: number;
};

type NotificationState = {
  notifications: NotificationItem[];
  syncNotifications: (incoming: NotificationItem[]) => void;
  removeNotification: (id: Id<"chatNotifications">) => void;
  clearAllNotifications: () => void;
};

function isValidNotificationId(id: string) {
  return !id.startsWith("room-") && !id.startsWith("friend-");
}

function sanitizeNotifications(items: NotificationItem[]) {
  return items.filter((item) => isValidNotificationId(String(item.id)));
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      syncNotifications: (incoming) =>
        set((state) => {
          const merged = new Map(
            sanitizeNotifications(state.notifications).map((item) => [item.id, item]),
          );
          sanitizeNotifications(incoming).forEach((item) => {
            merged.set(item.id, item);
          });

          return {
            notifications: Array.from(merged.values()).sort(
              (a, b) => b.createdAt - a.createdAt,
            ),
          };
        }),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((item) => item.id !== id),
        })),
      clearAllNotifications: () =>
        set({
          notifications: [],
        }),
    }),
    {
      name: "portal-notifications",
      partialize: (state) => ({
        notifications: sanitizeNotifications(state.notifications),
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<NotificationState> | undefined;
        return {
          ...currentState,
          ...persisted,
          notifications: sanitizeNotifications(persisted?.notifications || []),
        };
      },
    },
  ),
);
