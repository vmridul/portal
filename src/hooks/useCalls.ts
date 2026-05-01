import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { CallRecord } from "@/lib/types/call";

export function useCalls(roomId: string) {
  const activeCalls = useQuery(api.calls.getActiveCalls, { roomId });
  const recentCalls = useQuery(api.calls.getRecentCalls, { roomId, limit: 20 });

  return {
    activeCalls: (activeCalls ?? []) as CallRecord[],
    recentCalls: (recentCalls ?? []) as CallRecord[],
    isLoading: activeCalls === undefined || recentCalls === undefined,
  };
}

export function useVisibleActiveCalls() {
  const activeCallsQuery = useQuery(api.calls.listAllActiveCalls, {});

  return {
    activeCalls: (activeCallsQuery ?? []) as CallRecord[],
    isLoading: activeCallsQuery === undefined,
  };
}