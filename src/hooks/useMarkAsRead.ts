"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback, useEffect, useRef } from "react";

/**
 * useMarkAsRead — the ONLY place that triggers marking a conversation as read.
 * 
 * Features:
 * - Debounced (300ms) to avoid spamming mutations during rapid message arrival
 * - Visibility-aware: only fires when the tab is focused AND visible
 * - Idempotent: backend ignores if readUntil <= current lastReadTime
 */
export function useMarkAsRead(conversationId: string | null) {
  const markReadMutation = useMutation(api.readState.markConversationRead);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef<number>(0);

  const markAsRead = useCallback(
    (readUntil: number) => {
      if (!conversationId) return;

      // Skip if we'd send the same or smaller timestamp
      if (readUntil <= lastSentRef.current) return;

      // Skip if tab is not visible
      if (document.hidden || document.visibilityState !== "visible") return;

      // Debounce: cancel pending, schedule new
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        lastSentRef.current = readUntil;
        markReadMutation({
          conversation_id: conversationId,
          read_until: readUntil,
        }).catch((e) => console.error("Failed to mark as read:", e));
      }, 300);
    },
    [conversationId, markReadMutation],
  );

  // Cleanup on unmount or conversation change
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [conversationId]);

  // Re-fire when tab becomes visible (handles alt-tab back scenario)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && lastSentRef.current > 0) {
        // Re-send the last known timestamp
        markAsRead(lastSentRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [markAsRead]);

  return markAsRead;
}