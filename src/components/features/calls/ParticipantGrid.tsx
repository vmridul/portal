"use client";

import { useCallStore } from "@/store/callStore";
import { useCalls } from "@/hooks";
import { ParticipantCard } from "./ParticipantCard";
import { useUserStore } from "@/store/useUserStore";

export const ParticipantGrid = () => {
  const { callId, actualRoomId, remoteStreams, activeSpeakers, localStream } = useCallStore();
  const { activeCalls } = useCalls(actualRoomId || "");
  const activeCall = activeCalls.find((call) => call._id === callId);
  const currentUserId = useUserStore((s) => s.user?.user_id);

  const participants = activeCall?.participants || (currentUserId ? [currentUserId] : []);

  // Current user always first
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a === currentUserId) return -1;
    if (b === currentUserId) return 1;
    return 0;
  });

  const count = sortedParticipants.length;
  let gridClass = "grid-cols-1";
  if (count === 2) gridClass = "grid-cols-1 md:grid-cols-2";
  else if (count >= 3 && count <= 4) gridClass = "grid-cols-2";
  else if (count >= 5 && count <= 6) gridClass = "grid-cols-2 md:grid-cols-3";
  else if (count >= 7) gridClass = "grid-cols-3 md:grid-cols-4";

  return (
    <div className={`w-full h-full p-4 pt-6 grid gap-4 ${gridClass} auto-rows-fr`}>
      {sortedParticipants.map((userId) => {
        const isLocal = userId === currentUserId;
        const stream = isLocal ? localStream : remoteStreams?.[userId];
        const mediaState = activeCall?.mediaStates?.find(m => m.userId === userId);

        return (
          <ParticipantCard
            key={userId}
            userId={userId}
            isSpeaking={activeSpeakers?.includes(userId) || false}
            videoStream={stream || null}
            isLocal={isLocal}
            isVideoOn={mediaState?.isVideoOn ?? false}
            isMuted={mediaState?.isMuted ?? false}
          />
        );
      })}
    </div>
  );
};
