"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, PhoneOff, PhoneCall } from "lucide-react";
import { useCallSessionActions } from "@/hooks";
import { useUserStore } from "@/store/useUserStore";
import { useJitsiStore } from "@/store/jitsiStore";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUIStore } from "@/store/uiStore";
import { useRooms } from "@/contexts/roomContext";
import AvatarStack from "../AvatarStack";

interface Call {
  _id: Id<"calls">;
  participants: string[];
  startedAt: number;
  roomId: string;
}

interface ActiveCallPanelProps {
  call: Call;
  onLeave: () => void;
}

function formatDuration(startMs: number): string {
  const seconds = Math.floor((Date.now() - startMs) / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ActiveCallPanel({ call, onLeave }: ActiveCallPanelProps) {
  const user = useUserStore((s) => s.user);
  const [duration, setDuration] = useState(formatDuration(call.startedAt));
  const [isLeaving, setIsLeaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { rooms } = useRooms();
  const { setModal } = useUIStore();
  const { joinExistingSession, leaveCurrentSession } = useCallSessionActions();
  const {
    isJoined: jitsiStoreJoined,
    isConnecting,
    callId: activeCallId,
    isMuted,
    toggleMute,
    error: jitsiError,
  } = useJitsiStore();

  const isJitsiJoined = jitsiStoreJoined && activeCallId === call._id;
  const isThisCallConnecting = isConnecting && activeCallId === call._id;
  const hasOtherActiveSession =
    !!activeCallId && activeCallId !== call._id && (jitsiStoreJoined || isConnecting);
  const activeError = activeCallId === call._id ? jitsiError : null;

  const participantProfiles = useQuery(api.users.getUsersByExternalIds, {
    user_ids: call.participants
  }) || [];

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(formatDuration(call.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [call.startedAt]);

  const handleJoin = async () => {
    setLocalError(null);

    if (hasOtherActiveSession) {
      const roomData = rooms.find(r => r.room_id === call.roomId);
      setModal("SWITCH_CALL", {
        newCallId: call._id,
        newRoomId: call.roomId,
        newRoomName: roomData?.Rooms?.room_name || "Unknown Room",
        oldCallId: activeCallId,
      });
      return;
    }

    try {
      const roomData = rooms.find(r => r.room_id === call.roomId);
      await joinExistingSession({
        callId: call._id,
        user: {
        userId: user?.user_id,
        displayName: user?.username || "Guest",
        avatarUrl: user?.avatar || undefined
        },
        room: {
          id: call.roomId,
          name: roomData?.Rooms?.room_name || "Unknown Room",
        },
      });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to join call",
      );
    }
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    setLocalError(null);
    try {
      await leaveCurrentSession(call._id);
      onLeave();
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to leave call",
      );
      setIsLeaving(false);
    }
  };

  const handleToggleMute = () => {
    setLocalError(null);
    void toggleMute().catch((error) => {
      setLocalError(
        error instanceof Error ? error.message : "Failed to toggle mute",
      );
    });
  };

  if (!isJitsiJoined) {
    return (
      <div className="p-3 border-b border-theme-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-white">Active Call</span>
          </div>
          <span className="text-xs text-gray-400">{duration}</span>
        </div>

        <div className="flex items-center mb-3">
          <AvatarStack users={participantProfiles} size={24} showCount />
        </div>

        {(activeError || localError) && (
          <div className="mb-3 p-2 text-xs bg-red-500/10 text-red-400 rounded border border-red-500/20 text-center">
            {localError || activeError}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={isThisCallConnecting || isJitsiJoined}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          <PhoneCall className={`w-4 h-4 ${isThisCallConnecting ? "animate-bounce" : ""}`} />
          <span className="text-sm">{isThisCallConnecting ? "Connecting to call..." : "Join Call"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 border-b border-theme-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-white">Active Call</span>
        </div>
        <span className="text-xs text-gray-400">{duration}</span>
      </div>

      <div className="flex items-center mb-3">
        <AvatarStack users={participantProfiles} size={24} showCount />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleToggleMute}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${isMuted ? "bg-red-500/20 text-red-400" : "bg-theme-hover text-white"
            }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="text-sm">{isMuted ? "Unmute" : "Mute"}</span>
        </button>
        <button
          onClick={handleLeave}
          disabled={isLeaving}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="text-sm">Leave</span>
        </button>
      </div>
    </div>
  );
}
