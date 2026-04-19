"use client";

import { Hash, Mic, MicOff, PhoneOff } from "lucide-react";
import { useJitsiStore } from "@/store/jitsiStore";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { useCallSessionActions } from "@/hooks";
import { memo } from "react";

const PersistentCallWidget = () => {
  const { isJoined, roomName, actualRoomId, callId, isMuted, toggleMute } = useJitsiStore();
  const { setSidebarOpen, setSidebarTab } = useUIStore();
  const { leaveCurrentSession } = useCallSessionActions();
  const router = useRouter();

  // Render logic: Show ONLY if joined
  if (!isJoined) return null;

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!callId) return;

    try {
      await leaveCurrentSession(callId);
    } catch {
      // Best effort widget leave.
    }
  };

  const handleClick = () => {
    if (actualRoomId) {
      router.push(`/portal/room/${actualRoomId}`);
      setSidebarOpen(true);
      setSidebarTab("calls");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex justify-between bg-theme-hover items-center cursor-pointer ease-in-out rounded-lg w-60 px-3 py-2 group"
    >
      <div className="flex items-center gap-2 text-gray-100 min-w-0">
        <Hash className="w-4 h-4" />
        <span className="text-sm font-medium truncate max-w-[100px]">
          {roomName || "Current Call"}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className={`p-2 rounded-xl transition-all ${isMuted
            ? "text-red-500 scale-110"
            : "text-gray-300 hover:text-white"
            }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={handleLeave}
          className="p-2 rounded-xl bg-red-800 text-red-100 hover:bg-red-900 transition-all duration-200"
          title="Leave Call"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default memo(PersistentCallWidget);
