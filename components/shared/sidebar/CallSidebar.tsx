"use client";

import { useCalls, useCallSessionActions } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import ActiveCallPanel from "./ActiveCallPanel";
import RecentCallsList from "./RecentCallsList";
import { useUserStore } from "@/store/useUserStore";
import { useColor } from "@/contexts/colorContext";
import { useRooms } from "@/contexts/roomContext";
import { Phone } from "@phosphor-icons/react";

interface CallSidebarProps {
  roomId: string;
  conversationName?: string;
}

export default function CallSidebar({
  roomId,
  conversationName,
}: CallSidebarProps) {
  const { activeCalls, recentCalls, isLoading } = useCalls(roomId);
  const setActiveCall = useUIStore((s) => s.setActiveCall);
  const { startAndJoinCall } = useCallSessionActions();
  const user = useUserStore((s) => s.user);
  const { color, textColor } = useColor();
  const { rooms } = useRooms();

  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading...</div>;
  }

  const endedCalls = recentCalls.filter((c) => !c.isActive);
  const userInAnyCall = user && activeCalls.some(c => c.participants.includes(user.user_id));

  const handleStartNewCall = async () => {
    try {
      const roomData = rooms.find((room) => room.room_id === roomId);
      await startAndJoinCall({
        roomId,
        roomName:
          conversationName ||
          roomData?.Rooms?.room_name ||
          "Unknown Conversation",
        user: {
          displayName: user?.username || "Guest",
          userId: user?.user_id,
          avatarUrl: user?.avatar || undefined,
        },
      });
    } catch (error) {
      console.error("[CallSidebar] Failed to start call:", error);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-theme-base overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeCalls.map((call) => (
          <ActiveCallPanel
            key={call._id}
            call={call}
            conversationName={conversationName}
            onLeave={() => {
              setActiveCall(null);
            }}
          />
        ))}

        <RecentCallsList
          calls={endedCalls}
        />
      </div>

      {!userInAnyCall && (
        <div className="shrink-0 border-t border-theme-border/50 px-4 py-4 text-sm bg-theme-base">
          <button
            onClick={handleStartNewCall}
            style={{ backgroundColor: color, color: textColor }}
            className="w-full py-2 flex items-center justify-center gap-3 rounded-[12px] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Phone className="w-3 h-3" weight="fill" />
            Start New Call
          </button>
        </div>
      )}
    </div>
  );
}
