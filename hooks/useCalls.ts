import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCalls(roomId: string) {
  const startCall = useMutation(api.calls.startCall);
  const joinCall = useMutation(api.calls.joinCall);
  const leaveCall = useMutation(api.calls.leaveCall);
  const activeCall = useQuery(api.calls.getActiveCall, { roomId });
  const recentCalls = useQuery(api.calls.getRecentCalls, { roomId, limit: 20 });

  return {
    startCall: () => startCall({ roomId }),
    joinCall: (callId: string) => joinCall({ callId: callId as any }),
    leaveCall: (callId: string) => leaveCall({ callId: callId as any }),
    activeCall,
    recentCalls: recentCalls ?? [],
    isLoading: activeCall === undefined || recentCalls === undefined,
  };
}