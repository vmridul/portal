import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CallSessionTarget } from "@/lib/types/call";
import { useCallStore } from "@/store/callStore";
import { useUIStore } from "@/store/uiStore";

interface StartCallInput {
  roomId: string;
  roomName: string;
  userId: string;
}

export function useCallSessionActions() {
  const leaveCallMutation = useMutation(api.calls.leaveCall);
  const startCallMutation = useMutation(api.calls.startCall);
  const joinCallMutation = useMutation(api.calls.joinCall);
  const updateMediaState = useMutation(api.calls.updateMediaState);

  const setModal = useUIStore((state) => state.setModal);
  const setCallOverlayOpen = useUIStore((state) => state.setCallOverlayOpen);

  const joinCall = useCallStore((state) => state.joinCall);
  const leaveCall = useCallStore((state) => state.leaveCall);
  const activeCallId = useCallStore((state) => state.callId);
  const status = useCallStore((state) => state.status);

  const isJoined = status === "joined";
  const isConnecting = status === "joining";

  /**
   * Start a new call: create the Convex record first, then join PeerJS
   * with the real callId. No more "temp" workaround.
   */
  const startAndJoinCall = async ({
    roomId,
    roomName,
    userId,
  }: StartCallInput): Promise<Id<"calls">> => {
    if (!navigator.onLine) {
      useCallStore.getState().setError("No internet connection.");
      throw new Error("Offline");
    }
    useCallStore.getState().setUpdateMediaState(updateMediaState);

    // Create call in Convex first to get the real callId
    const callId = await startCallMutation({ roomId, peerId: "" });

    const peerId = await joinCall({
      callId,
      room: { id: roomId, name: roomName },
      userId,
    });

    setCallOverlayOpen(true);

    // Update with the actual peerId now that PeerJS is connected
    await joinCallMutation({ callId, peerId });

    return callId;
  };

  /** Join an existing call that was started by someone else. */
  const joinExistingSession = async (target: CallSessionTarget) => {
    if (!navigator.onLine) {
      useCallStore.getState().setError("No internet connection.");
      return;
    }
    useCallStore.getState().setUpdateMediaState(updateMediaState);
    const peerId = await joinCall(target);
    setCallOverlayOpen(true);

    try {
      await joinCallMutation({ callId: target.callId, peerId });
    } catch (error) {
      await leaveCall();
      throw error;
    }
  };

  /** Leave the current call. */
  const leaveCurrentSession = async (callId: Id<"calls">) => {
    await leaveCall();
    await leaveCallMutation({ callId });
  };

  /** Switch from one call to another. */
  const switchSession = async (
    nextTarget: CallSessionTarget,
    currentCallId: Id<"calls">,
  ) => {
    await leaveCall();
    await leaveCallMutation({ callId: currentCallId });

    try {
      const peerId = await joinCall(nextTarget);
      setCallOverlayOpen(true);
      await joinCallMutation({ callId: nextTarget.callId, peerId });
    } catch (error) {
      await leaveCall();
      throw error;
    }
  };

  /** Join a call, or show a switch confirmation modal if already in one. */
  const joinOrSwitchSession = async (target: CallSessionTarget) => {
    if (activeCallId === target.callId && isJoined) {
      return { switchedViaModal: false as const };
    }

    if (
      activeCallId &&
      activeCallId !== target.callId &&
      (isJoined || isConnecting)
    ) {
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

  /** Start a call, or show a switch confirmation modal if already in one. */
  const startOrSwitchSession = async (input: StartCallInput) => {
    if (activeCallId && (isJoined || isConnecting)) {
      setModal("SWITCH_CALL", {
        newRoomId: input.roomId,
        newRoomName: input.roomName,
        oldCallId: activeCallId,
        isStartingNew: true,
      });
      return { switchedViaModal: true as const };
    }

    await startAndJoinCall(input);
    return { switchedViaModal: false as const };
  };

  return {
    joinExistingSession,
    joinOrSwitchSession,
    startAndJoinCall,
    startOrSwitchSession,
    leaveCurrentSession,
    switchSession,
  };
}
