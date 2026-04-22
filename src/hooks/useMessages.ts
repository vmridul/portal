"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { MessageWithSender } from "@/lib/types";
import { useMemo } from "react";

export interface UseMessagesOptions {
  conversationId: string;
  limit?: number;
}

export interface UseMessagesResult {
  messages: MessageWithSender[];
  status: "Loaded" | "Loading";
  isLoading: boolean;
}

export function useMessages({
  conversationId,
  limit = 1000,
}: UseMessagesOptions): UseMessagesResult {
  const results = useQuery(api.messages.getAllMessages, {
    conversation_id: conversationId,
    limit,
  });

  const messages = useMemo(() => {
    if (!results) return [];
    // Reverse results because backend returns newest first (desc),
    // but UI expects chronological order (oldest first).
    return [...results].reverse() as MessageWithSender[];
  }, [results]);

  const isLoading = results === undefined;
  const status = isLoading ? "Loading" : "Loaded";

  return {
    messages,
    status,
    isLoading,
  };
}
