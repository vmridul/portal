"use client";

import * as React from "react";
import { SidebarLayout, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { useCalls, useCallSessionActions } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import ActiveCallPanel from "./ActiveCallPanel";
import RecentCallsList from "./RecentCallsList";
import { useUserStore } from "@/store/useUserStore";
import { useRooms } from "@/contexts/roomContext";
import { HugeiconsIcon } from "@hugeicons/react";
import { CallIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

interface SidebarCallsProps {
  roomId: string;
  conversationName?: string;
  onClose: () => void;
}

export function SidebarCalls({ roomId, conversationName, onClose }: SidebarCallsProps) {
  const { activeCalls, recentCalls, isLoading } = useCalls(roomId);
  const setActiveCall = useUIStore((s) => s.setActiveCall);
  const { startAndJoinCall } = useCallSessionActions();
  const user = useUserStore((s) => s.user);
  const { rooms } = useRooms();

  if (isLoading) {
    return (
      <SidebarLayout>
        <SidebarHeader title="Calls" onClose={onClose} />
        <div className="p-4 text-gray-400">Loading...</div>
      </SidebarLayout>
    );
  }

  const endedCalls = recentCalls.filter((c) => !c.isActive);
  const userInAnyCall = user && activeCalls.some(c => c.participants.includes(user.user_id));

  const handleStartNewCall = async () => {
    try {
      const roomData = rooms.find((room) => room.room_id === roomId);
      await startAndJoinCall({
        roomId,
        roomName: conversationName || roomData?.Rooms?.room_name || "Unknown Conversation",
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

  const hasNoCalls = activeCalls.length === 0 && endedCalls.length === 0;

  return (
    <SidebarLayout>
      <SidebarHeader title="Calls" onClose={onClose} />
      <div className="flex-1 min-h-0 overflow-y-auto">
        {hasNoCalls ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 p-4">
            <p className="text-sm">No calls yet</p>
          </div>
        ) : (
          <>
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
            <RecentCallsList calls={endedCalls} />
          </>
        )}
      </div>
      {!userInAnyCall && (
        <SidebarFooter>
          <Button variant="other" onClick={handleStartNewCall} className="w-full">
            <HugeiconsIcon icon={CallIcon} className="w-3 h-3 mr-2" />
            Start New Call
          </Button>
        </SidebarFooter>
      )}
    </SidebarLayout>
  );
}
