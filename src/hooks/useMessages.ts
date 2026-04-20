"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { MessageWithSender } from "@/lib/types";
import { useMemo } from "react";

export interface UseMessagesOptions {
  conversationId: string;
  limit?: number;
}

export interface UseMessagesResult {
  messages: MessageWithSender[];
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadMore: () => void;
  isLoading: boolean;
}

export function useMessages({ 
  conversationId, 
  limit = 50 
}: UseMessagesOptions): UseMessagesResult {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.getMessagesPaginated,
    { conversation_id: conversationId },
    { initialNumItems: limit }
  );

  const messages = useMemo(() => {
    // Reverse results because backend returns newest first (desc),
    // but UI expects chronological order (oldest first).
    return [...results].reverse() as MessageWithSender[];
  }, [results]);

  return {
    messages,
    status,
    loadMore: () => loadMore(limit),
    isLoading: status === "LoadingFirstPage",
  };
}