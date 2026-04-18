"use client";

import { Phone } from "lucide-react";
import { useCalls } from "@/hooks";
import { Id } from "@/convex/_generated/dataModel";

interface Call {
  _id: Id<"calls">;
  participants: string[];
  startedAt: number;
  endedAt?: number;
  isActive: boolean;
}

function formatCallTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCallDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupCallsByDate(calls: Call[]): Record<string, Call[]> {
  const groups: Record<string, Call[]> = {};
  for (const call of calls) {
    const dateKey = formatCallDate(call.startedAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(call);
  }
  return groups;
}

interface RecentCallsListProps {
  roomId: string;
  calls: Call[];
}

export default function RecentCallsList({ roomId, calls }: RecentCallsListProps) {
  const { startCall } = useCalls(roomId);
  const grouped = groupCallsByDate(calls);

  const handleStartNewCall = async () => {
    await startCall();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3">
        <button
          onClick={handleStartNewCall}
          className="w-full py-2 px-4 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Start New Call
        </button>
      </div>

      {Object.entries(grouped).map(([date, dateCalls]) => (
        <div key={date} className="border-t border-theme-border">
          <div className="px-3 py-2 text-xs text-gray-500 uppercase">{date}</div>
          {dateCalls.map((call) => (
            <div
              key={call._id}
              className="px-3 py-2 hover:bg-theme-hover cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-theme-base flex items-center justify-center">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    {call.participants.length} participants
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCallTime(call.startedAt)}
                  </div>
                </div>
                {call.endedAt && (
                  <div className="text-xs text-gray-500">
                    {Math.round((call.endedAt - call.startedAt) / 60000)}m
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}