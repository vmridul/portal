import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface CallParticipant {
  _id: Id<"calls">;
  participants: string[];
  activePeerIds?: { userId: string; peerId: string }[];
  startedAt: number;
  roomId: string;
  isActive: boolean;
}

export function useCalls(roomId: string) {
  const activeCalls = useQuery(api.calls.getActiveCalls, { roomId });
  const recentCalls = useQuery(api.calls.getRecentCalls, { roomId, limit: 20 });

  return {
    activeCalls: (activeCalls ?? []) as CallParticipant[],
    recentCalls: (recentCalls ?? []) as CallParticipant[],
    isLoading: activeCalls === undefined || recentCalls === undefined,
  };
}

export function useVisibleActiveCalls() {
  const activeCallsQuery = useQuery(api.calls.listAllActiveCalls, {});

  return {
    activeCalls: (activeCallsQuery ?? []) as CallParticipant[],
    isLoading: activeCallsQuery === undefined,
  };
}