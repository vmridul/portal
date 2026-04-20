import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CallSessionTarget } from "@/lib/types/call";
import { useCallStore } from "@/store/callStore";
import { useUIStore } from "@/store/uiStore";

interface StartAndJoinCallInput {
  roomId: string;
  roomName: string;
  user: CallSessionTarget["user"];
}

export function useCallSessionActions() {
  const leaveCall = useMutation(api.calls.leaveCall);
  const startCallMutation = useMutation(api.calls.startCall);
  const joinCallMutation = useMutation(api.calls.joinCall);
  const endCallMutation = useMutation(api.calls.endCall);

  const setModal = useUIStore((state) => state.setModal);
  const joinExistingCall = useCallStore((state) => state.joinExistingCall);
  const leaveActiveCall = useCallStore((state) => state.leaveActiveCall);
  const activeCallId = useCallStore((state) => state.callId);
  const isJoined = useCallStore((state) => state.isJoined);
  const isConnecting = useCallStore((state) => state.isConnecting);

  const startAndJoinCall = async ({
    roomId,
    roomName,
    user,
  }: StartAndJoinCallInput): Promise<Id<"calls">> => {
    const peerId = await joinExistingCall({
      callId: "temp" as unknown as Id<"calls">,
      room: { id: roomId, name: roomName },
      user,
    });

    const callId = await startCallMutation({ roomId, peerId });
    useCallStore.setState({ callId });

    return callId;
  };

  const joinExistingSession = async (target: CallSessionTarget) => {
    const peerId = await joinExistingCall(target);

    try {
      await joinCallMutation({ callId: target.callId, peerId });
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
      const peerId = await joinExistingCall(nextTarget);
      await joinCallMutation({ callId: nextTarget.callId, peerId });
    } catch (error) {
      await leaveActiveCall();
      throw error;
    }
  };

  const joinOrSwitchSession = async (target: CallSessionTarget) => {
    if (activeCallId === target.callId && isJoined) {
      return { switchedViaModal: false as const };
    }

    if (activeCallId && activeCallId !== target.callId && (isJoined || isConnecting)) {
      setModal("SWITCH_CALL", {
        newCallId: target.callId,
        newRoomId: target.room.id,
        newRoomName: target.room.name,
        oldCallId: activeCallId,
      });
      return { switchedViaModal: true as const };
    }

    await joinExistingSession(target);
    return { switchedViaModal: false as const };
  };

  return {
    startAndJoinCall,
    joinExistingSession,
    joinOrSwitchSession,
    leaveCurrentSession,
    switchSession,
    endCall: endCallMutation,
  };
}