"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useCalls } from "@/hooks";
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
  const { leaveCall } = useCalls(call.roomId);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(formatDuration(call.startedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(formatDuration(call.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [call.startedAt]);

  const handleLeave = async () => {
    await leaveCall(call._id);
    onLeave();
  };

  return (
    <div className="p-3 border-b border-theme-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-white">Active Call</span>
        </div>
        <span className="text-xs text-gray-400">{duration}</span>
      </div>
      
      <div className="text-sm text-gray-400 mb-3">
        {call.participants.length} participant{call.participants.length !== 1 ? "s" : ""}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
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