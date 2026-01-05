import { supabase } from "@/lib/supabase/client";
import React from "react";

export const loadOlderMessages = async ({
  type,
  oldestCursor,
  loadingOlder,
  containerRef,
  setMessages,
  setOldestCursor,
  PAGE_SIZE,
  setLoadingOlder,
  setShouldScrollToBottom,
  room_id,
}: {
  type: "friend" | "room";
  oldestCursor: string | null;
  loadingOlder: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setOldestCursor: React.Dispatch<React.SetStateAction<string | null>>;
  PAGE_SIZE: number;
  setLoadingOlder: React.Dispatch<React.SetStateAction<boolean>>;
  setShouldScrollToBottom: React.Dispatch<React.SetStateAction<boolean>>;
  room_id: string;
}) => {
  if (!oldestCursor || loadingOlder || !containerRef.current) return;

  setLoadingOlder(true);
  setShouldScrollToBottom(false);
  const container = containerRef.current;
  const prevScrollHeight = container?.scrollHeight;
  const { data, error } = await supabase
    .from(type === "friend" ? "FriendMessages" : "Messages")
    .select(
      `
      *,
      sender:Users!sender_id (
        user_id,
        avatar,
        username
      )
    `
    )
    .eq(type === "friend" ? "receiver_id" : "room_id", room_id)
    .lt("sent_at", oldestCursor)
    .order("sent_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    console.error(error);
    setLoadingOlder(false);
    return;
  }

  if (!data || data.length === 0) {
    setLoadingOlder(false);
    return;
  }

  setMessages((prev) => {
    const existingIds = new Set(prev.map((m) => m.id));
    const newMessages = data.reverse().filter((m) => !existingIds.has(m.id));

    return [...newMessages, ...prev];
  });
  setOldestCursor(data[data.length - 1].sent_at);

  requestAnimationFrame(() => {
    const newScrollHeight = container.scrollHeight;
    container.scrollTop = newScrollHeight - prevScrollHeight;
  });

  setLoadingOlder(false);
};
