import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useCalls(roomId: string) {
  const startCall = useMutation(api.calls.startCall);
  const joinCall = useMutation(api.calls.joinCall);
  const leaveCall = useMutation(api.calls.leaveCall);
  const endCall = useMutation(api.calls.endCall);
  const activeCalls = useQuery(api.calls.getActiveCalls, { roomId });
  const recentCalls = useQuery(api.calls.getRecentCalls, { roomId, limit: 20 });

  return {
    startCall: async () => {
      const callId = await startCall({ roomId });
      return callId;
    },
    joinCall: (callId: Id<"calls">) => joinCall({ callId }),
    leaveCall: (callId: Id<"calls">) => leaveCall({ callId }),
    endCall: (callId: Id<"calls">) => endCall({ callId }),
    activeCalls: activeCalls ?? [],
    recentCalls: recentCalls ?? [],
    isLoading: activeCalls === undefined || recentCalls === undefined,
  };
}

export function useVisibleActiveCalls() {
  const activeCallsQuery = useQuery(api.calls.listAllActiveCalls, {});

  return {
    activeCalls: activeCallsQuery ?? [],
    isLoading: activeCallsQuery === undefined,
  };
}
