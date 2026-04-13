"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { MessageWithSender, MessageSourceType } from "@/lib/types";

export interface UseMessagesOptions {
  type: MessageSourceType;
  roomId: string;
  limit?: number;
}

export interface UseMessagesResult {
  messages: MessageWithSender[];
  isLoading: boolean;
}

export function useMessages({ type, roomId, limit = 50 }: UseMessagesOptions): UseMessagesResult {
  const queryFn = type === "room" 
    ? api.messages.getRoomMessages 
    : api.messages.getFriendMessages;

  const result = useQuery(queryFn, type === "room" 
    ? { room_id: roomId, limit } 
    : { friend_id: roomId, limit }
  );

  return {
    messages: result ?? [],
    isLoading: result === undefined,
  };
}