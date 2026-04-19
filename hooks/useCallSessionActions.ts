import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CallSessionTarget } from "@/lib/types/call";
import { useJitsiStore } from "@/store/jitsiStore";

interface StartAndJoinCallInput {
  roomId: string;
  roomName: string;
  user: CallSessionTarget["user"];
}

export function useCallSessionActions() {
  const startCall = useMutation(api.calls.startCall);
  const joinCall = useMutation(api.calls.joinCall);
  const leaveCall = useMutation(api.calls.leaveCall);
  const endCall = useMutation(api.calls.endCall);
  const joinExistingCall = useJitsiStore((state) => state.joinExistingCall);
  const leaveActiveCall = useJitsiStore((state) => state.leaveActiveCall);

  const startAndJoinCall = async ({
    roomId,
    roomName,
    user,
  }: StartAndJoinCallInput): Promise<Id<"calls">> => {
    const callId = await startCall({ roomId });
    const target: CallSessionTarget = {
      callId,
      room: { id: roomId, name: roomName },
      user,
    };

    try {
      await joinExistingCall(target);
      return callId;
    } catch (error) {
      await endCall({ callId });
      throw error;
    }
  };

  const joinExistingSession = async (target: CallSessionTarget) => {
    await joinExistingCall(target);

    try {
      await joinCall({ callId: target.callId });
    } catch (error) {
      await leaveActiveCall();
      throw error;
    }
  };

  const leaveCurrentSession = async (callId: Id<"calls">) => {
    await leaveActiveCall();
    await leaveCall({ callId });
  };

  const switchSession = async (
    nextTarget: CallSessionTarget,
    currentCallId: Id<"calls">,
  ) => {
    await leaveActiveCall();
    await leaveCall({ callId: currentCallId });

    try {
      await joinExistingCall(nextTarget);
      await joinCall({ callId: nextTarget.callId });
    } catch (error) {
      await leaveActiveCall();
      throw error;
    }
  };

  return {
    startAndJoinCall,
    joinExistingSession,
    leaveCurrentSession,
    switchSession,
    endCall,
  };
}
