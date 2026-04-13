"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface UseSearchMessagesOptions {
  roomId: string;
  query: string;
}

export function useSearchMessages({ roomId, query }: UseSearchMessagesOptions) {
  const results = useQuery(api.messages.searchMessages, { room_id: roomId, query });
  return {
    results: results ?? [],
    isLoading: results === undefined,
  };
}