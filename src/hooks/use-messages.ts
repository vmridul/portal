"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { MessageWithSender } from "@/lib/types";

export interface UseMessagesOptions {
  conversationId: string;
  cursor?: number;
  limit?: number;
}

export interface UseMessagesResult {
  messages: MessageWithSender[];
  nextCursor: number | null;
  hasMore: boolean;
  isLoading: boolean;
}

export function useMessages({ 
  conversationId, 
  cursor, 
  limit = 50 
}: UseMessagesOptions): UseMessagesResult {
  const result = useQuery(
    api.messages.getMessagesPaginated, 
    {
      conversation_id: conversationId,
      cursor,
      limit,
    }
  );

  return {
    messages: result?.messages ?? [],
    nextCursor: result?.nextCursor ?? null,
    hasMore: result?.hasMore ?? false,
    isLoading: result === undefined,
  };
}