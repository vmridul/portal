import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useCalls(roomId: string) {
  const startCall = useMutation(api.calls.startCall);
  const joinCall = useMutation(api.calls.joinCall);
  const leaveCall = useMutation(api.calls.leaveCall);
  const activeCall = useQuery(api.calls.getActiveCall, { roomId });
  const recentCalls = useQuery(api.calls.getRecentCalls, { roomId, limit: 20 });

  return {
    startCall: () => startCall({ roomId }),
    joinCall: (callId: string) => joinCall({ callId: callId as unknown as Id<"calls"> }),
    leaveCall: (callId: string) => leaveCall({ callId: callId as unknown as Id<"calls"> }),
    activeCall,
    recentCalls: recentCalls ?? [],
    isLoading: activeCall === undefined || recentCalls === undefined,
  };
}