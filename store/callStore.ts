"use client";

import { create } from "zustand";
import { CallClient } from "@/lib/calls/client";
import type {
  CallSessionSnapshot,
  CallSessionTarget,
} from "@/lib/types/call";

const callClient = new CallClient();

const initialSnapshot: CallSessionSnapshot = {
  status: "idle",
  callId: null,
  actualRoomId: null,
  roomName: null,
  isMuted: false,
  participantCount: 0,
  error: null,
};

interface CallStoreState extends CallSessionSnapshot {
  isJoined: boolean;
  isConnecting: boolean;
  joinExistingCall: (target: CallSessionTarget) => Promise<string>;
  leaveActiveCall: () => Promise<void>;
  switchActiveCall: (target: CallSessionTarget) => Promise<string>;
  toggleMute: () => Promise<void>;
  clearError: () => void;
  syncParticipants: (participants: any[]) => void;
}

function snapshotToStore(snapshot: Partial<CallSessionSnapshot>) {
  return (state: CallStoreState): Partial<CallStoreState> => {
    return {
      ...snapshot,
      isJoined: (snapshot.status ?? state.status) === "joined",
      isConnecting: (snapshot.status ?? state.status) === "joining",
    };
  };
}

function resetSessionState(): Partial<CallStoreState> {
  return {
    ...initialSnapshot,
    isJoined: false,
    isConnecting: false,
  };
}

export const useCallStore = create<CallStoreState>((set, get) => ({
  ...initialSnapshot,
  isJoined: false,
  isConnecting: false,

  async joinExistingCall(target) {
    const currentCallId = get().callId;
    if (get().status === "joining" && currentCallId === target.callId) {
      return;
    }

    if (get().isJoined && currentCallId === target.callId) {
      return;
    }

    if (currentCallId && currentCallId !== target.callId) {
      await get().leaveActiveCall();
    }

    set({
      status: "joining",
      callId: target.callId,
      actualRoomId: target.room.id,
      roomName: target.room.name,
      isConnecting: true,
      error: null,
      participantCount: 0,
    });

    try {
      const peerId = await callClient.connect(target, {
        onStatusChange(snapshot) {
          set(snapshotToStore(snapshot));
        },
        onJoined() {
          set({
            status: "joined",
            isJoined: true,
            isConnecting: false,
            error: null,
          });
        },
        onDisconnected() {
          set(resetSessionState());
        },
        onError(message) {
          set({
            ...resetSessionState(),
            callId: target.callId,
            actualRoomId: target.room.id,
            roomName: target.room.name,
            status: "error",
            error: message,
          });
        },
      });
      return peerId;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join call";
      set({
        ...resetSessionState(),
        callId: target.callId,
        actualRoomId: target.room.id,
        roomName: target.room.name,
        status: "error",
        error: message,
      });
      throw error;
    }
  },

  async leaveActiveCall() {
    if (get().status === "idle") {
      return;
    }

    set({
      status: "leaving",
      isConnecting: false,
      error: null,
    });

    try {
      await callClient.disconnect();
    } finally {
      set(resetSessionState());
    }
  },

  async switchActiveCall(target) {
    await get().leaveActiveCall();
    return await get().joinExistingCall(target);
  },

  async toggleMute() {
    const isMuted = await callClient.toggleMute();
    set({ isMuted, error: null });
  },

  clearError() {
    const status = get().isJoined ? "joined" : "idle";
    set({
      error: null,
      status,
      isJoined: status === "joined",
      isConnecting: false,
    });
  },

  syncParticipants(participants) {
    if (get().status === "joined") {
      callClient.syncParticipants(participants);
    }
  },
}));
