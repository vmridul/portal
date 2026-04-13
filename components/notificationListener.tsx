"use client";

import { api } from "@/convex/_generated/api";
import { useNotificationStore } from "@/store/notificationStore";
import { useUIStore } from "@/store/uiStore";
import { useQuery } from "convex/react";
import { Bell, Hash, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

type ActiveFriendId = ReturnType<
  typeof useUIStore.getState
>["activeFriendPage"];

export default function NotificationListener() {
  const router = useRouter();
  const { setActiveFriendPage } = useUIStore();
  const notificationsQuery = useQuery(
    api.chatNotifications.getMessageNotifications,
  );
  const notifications = useMemo(
    () => notificationsQuery || [],
    [notificationsQuery],
  );
  const syncNotifications = useNotificationStore((s) => s.syncNotifications);
  const initializedRef = useRef(false);
  const knownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (notificationsQuery === undefined) {
      return;
    }

    syncNotifications(notifications);
  }, [notifications, notificationsQuery, syncNotifications]);

  useEffect(() => {
    if (notificationsQuery === undefined) {
      return;
    }

    const currentIds = new Set(notifications.map((item) => item.id));

    if (!initializedRef.current) {
      knownIdsRef.current = currentIds;
      initializedRef.current = true;
      return;
    }

    notifications.forEach((item) => {
      if (knownIdsRef.current.has(item.id)) return;

      toast.custom(
        () => (
          <button
            onClick={() => {
              toast.dismiss(item.id);
              if (item.sourceType === "friend") {
                setActiveFriendPage(item.sourceId as ActiveFriendId);
                router.push("/portal");
              } else {
                router.push(`/portal/room/${item.sourceId}`);
              }
            }}
            className="w-[min(72vw,350px)] rounded-[12px] border border-theme-border bg-theme-surface px-4 py-3 text-left text-white shadow-2xl"
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
                <p className="mt-1 max-h-10 overflow-hidden text-sm text-white/65">
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

    knownIdsRef.current = currentIds;
  }, [notifications, notificationsQuery, router, setActiveFriendPage]);

  return null;
}
