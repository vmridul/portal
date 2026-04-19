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
  const startCall = useMutation(api.calls.startCall);
  const joinCall = useMutation(api.calls.joinCall);
  const leaveCall = useMutation(api.calls.leaveCall);
  const endCall = useMutation(api.calls.endCall);
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
    // 1. We must generate the peerId first by connecting to the client
    // but startCall needs it too. So we insert a placeholder or we do it in reverse.
    // Actually, joinExistingCall returns a peerId.
    
    const targetBase: Partial<CallSessionTarget> = {
      room: { id: roomId, name: roomName },
      user,
    };

    // We can't joinExistingCall without a callId.
    // So we'll update startCall to be nullable peerId if needed? 
    // No, I already updated the mutation to REQUIRE it.
    // So we need to generate it locally or update the flow.
    
    // We'll use a temporary "peerId" just for the handshake if needed, 
    // but the best way is to keep the client's generated one.
    
    // Let's create a temporary target with a dummy callId to get the peerId
    const peerId = await joinExistingCall({
      callId: "temp" as any,
      room: { id: roomId, name: roomName },
      user,
    });

    const callId = await startCall({ roomId, peerId });
    
    // Now we update the actual callId in the store
    useCallStore.setState({ callId });

    return callId;
  };

  const joinExistingSession = async (target: CallSessionTarget) => {
    const peerId = await joinExistingCall(target);

    try {
      await joinCall({ callId: target.callId, peerId });
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
      await joinCall({ callId: nextTarget.callId, peerId });
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
    endCall,
  };
}
