"use client";

import { useJitsiStore } from "@/store/jitsiStore";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AvatarStack from "../AvatarStack";

interface Call {
  participants: string[];
  allParticipants?: string[];
  startedAt: number;
  endedAt?: number;
  isActive: boolean;
  roomId: string;
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
  calls: Call[];
}

export default function RecentCallsList({ calls }: RecentCallsListProps) {
  const jitsiError = useJitsiStore((state) => state.error);

  const grouped = groupCallsByDate(calls);

  // Collect all unique participant IDs to fetch profiles in one batch
  const allParticipantIds = Array.from(new Set(
    calls.flatMap(c => c.allParticipants || c.participants)
  ));

  const participantProfiles = useQuery(api.users.getUsersByExternalIds, {
    user_ids: allParticipantIds
  }) || [];


  return (
    <div className="flex-1 overflow-y-auto">
      {jitsiError && (
        <div className="p-3">
          <div className="p-2 text-xs bg-red-500/10 text-red-400 rounded border border-red-500/20 text-center">
            {jitsiError}
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([date, dateCalls]) => (
        <div key={date} className="border-t border-theme-border/50">
          <div className="px-3 py-2 text-xs font-bold text-gray-500">{date}</div>
          {dateCalls.map((call, idx) => (
            <div
              key={idx}
              className="px-3 py-3 hover:bg-theme-hover/50 cursor-pointer transition-colors border-b border-theme-border/30 last:border-0"
            >
              <div className="flex items-center gap-3 px-2">

                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <AvatarStack
                      users={participantProfiles.filter(p =>
                        (call.allParticipants || call.participants).includes(p.user_id)
                      )}
                      size={24}
                      showCount
                    />
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    {formatCallTime(call.startedAt)}
                    {call.endedAt && (
                      <span className="flex items-center gap-1">
                        • {Math.round((call.endedAt - call.startedAt) / 60000)}m
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
