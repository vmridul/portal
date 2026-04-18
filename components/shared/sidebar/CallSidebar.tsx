"use client";

import { useCalls } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import ActiveCallPanel from "./ActiveCallPanel";
import RecentCallsList from "./RecentCallsList";

interface CallSidebarProps {
  roomId: string;
}

export default function CallSidebar({ roomId }: CallSidebarProps) {
  const { activeCall, recentCalls, isLoading } = useCalls(roomId);
  const setActiveCall = useUIStore((s) => s.setActiveCall);

  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {activeCall && (
        <ActiveCallPanel
          call={activeCall}
          onLeave={() => {
            setActiveCall(null);
          }}
        />
      )}
      <RecentCallsList roomId={roomId} calls={recentCalls} />
    </div>
  );
}