"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, PhoneOff, PhoneCall, Users } from "lucide-react";
import { useCalls } from "@/hooks";
import { useUserStore } from "@/store/useUserStore";
import { useJitsiStore } from "@/store/jitsiStore";
import { Id } from "@/convex/_generated/dataModel";

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
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { joinCall } = useCalls(call.roomId);
  const { isJoined: isJitsiJoined, isMuted, participantCount, joinRoom, leaveRoom, toggleMute } = useJitsiStore();
  
  const isInCall = user && call.participants.includes(user.user_id);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(formatDuration(call.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [call.startedAt]);

  useEffect(() => {
    if (isJitsiJoined && !isInCall) {
      joinCall(call._id);
    }
  }, [isJitsiJoined]);

  const handleJoin = async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await joinRoom(call.roomId);
    } catch (err) {
      console.error("Failed to join call:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeave = async () => {
    leaveRoom();
    onLeave();
  };

  if (!isJitsiJoined && !isInCall) {
    return (
      <div className="p-3 border-b border-theme-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-white">Active Call</span>
          </div>
          <span className="text-xs text-gray-400">{duration}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Users className="w-4 h-4" />
          <span>{call.participants.length} participant{call.participants.length !== 1 ? "s" : ""} already in call</span>
        </div>

        <button
          onClick={handleJoin}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          <PhoneCall className="w-4 h-4" />
          <span className="text-sm">{isConnecting ? "Connecting..." : "Join Call"}</span>
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
      
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <Users className="w-4 h-4" />
        <span>{participantCount || call.participants.length} in call</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleMute}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            isMuted ? "bg-red-500/20 text-red-400" : "bg-theme-hover text-white"
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="text-sm">{isMuted ? "Unmute" : "Mute"}</span>
        </button>
        <button
          onClick={handleLeave}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="text-sm">Leave</span>
        </button>
      </div>
    </div>
  );
}