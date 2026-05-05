"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { CallRecord } from "@/lib/types/call";
import { useRoomCallContext } from "@/contexts/CallContext";

export interface UseCallsResult {
  activeCalls: CallRecord[];
  recentCalls: CallRecord[];
  isLoading: boolean;
  participantProfiles?: Record<string, any>;
}

/**
 * Smart hook for room-specific calls.
 * Uses context if available for the matching roomId, otherwise falls back to a direct query.
 */
export function useCalls(roomId: string): UseCallsResult {
  const context = useRoomCallContext();

  if (context && context.roomId === roomId) {
    return context;
  }

  return useCallsQuery(roomId);
}

/**
 * Internal query hook used by RoomCallProvider and as fallback for useCalls.
 */
export function useCallsQuery(roomId: string): UseCallsResult {
  const activeCalls = useQuery(api.calls.getActiveCalls, { roomId });
  const recentCalls = useQuery(api.calls.getRecentCalls, { roomId, limit: 20 });

  return {
    activeCalls: (activeCalls ?? []) as CallRecord[],
    recentCalls: (recentCalls ?? []) as CallRecord[],
    isLoading: activeCalls === undefined || recentCalls === undefined,
  };
}