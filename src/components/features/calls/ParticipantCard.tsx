"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { MicOff02Icon, VideoOffIcon } from "@hugeicons/core-free-icons";

interface ParticipantCardProps {
  userId: string;
  isSpeaking?: boolean;
  videoStream?: MediaStream | null;
  isLocal?: boolean;
  isVideoOn: boolean;
  isMuted: boolean;
}

export const ParticipantCard = ({
  userId,
  isSpeaking = false,
  videoStream = null,
  isLocal = false,
  isVideoOn,
  isMuted,
}: ParticipantCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const profiles = useQuery(api.users.getUsersByExternalIds, { user_ids: [userId] });
  const profile = profiles?.[0];

  const name = profile?.username || "Connecting...";
  const avatarUrl = profile?.avatar;

  // Use server-authoritative media state
  const hasVideo = isVideoOn && !!videoStream;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hasVideo && videoStream) {
      if (video.srcObject !== videoStream) {
        video.srcObject = videoStream;
      }
      // Ensure it's playing
      void video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [hasVideo, videoStream]);

  return (
    <div className={`relative w-full h-full bg-theme-base rounded-2xl overflow-hidden flex items-center justify-center border transition-all duration-500 border-theme-border`}>
      
      {/* Video element - always present to prevent flickering from mount/unmount */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover scale-110 transition-opacity duration-500 ${hasVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Avatar/Placeholder - shown when video is off */}
      {!hasVideo && (
        <div className="flex flex-col items-center justify-center transition-opacity duration-500">
          {avatarUrl ? (
            <div className={`relative rounded-full w-32 h-32 transition-transform duration-500 `}>
              <div className={`absolute inset-0 rounded-full theme-accent opacity-0 transition-opacity duration-300 ${isSpeaking ? 'opacity-20 blur-xl animate-pulse' : ''}`} />
              <div className={`relative w-full h-full rounded-full overflow-hidden border-2 ${isSpeaking ? 'border-theme-accent' : 'border-theme-border'} transition-colors duration-300`}>
                <Image src={avatarUrl} alt={name} fill className="object-cover" />
              </div>
            </div>
          ) : (
            <div className={`w-32 h-32 rounded-full bg-theme-base flex items-center justify-center text-4xl font-bold text-white border-4 ${isSpeaking ? 'border-theme-accent scale-110' : 'border-theme-border'} transition-all duration-500 shadow-2xl`}>
              {name[0].toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Status Icons */}


      {/* Name Label */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white ">
        <span>{name}</span>
        <div className=" flex items-center">
          {isMuted && (
            <div className="p-1.5 rounded-lg">
              <HugeiconsIcon icon={MicOff02Icon} className="w-3.5 h-3.5 text-gray-300" />
            </div>
          )}
          {!hasVideo && (
            <div className="p-1.5 rounded-lg">
              <HugeiconsIcon icon={VideoOffIcon} className="w-3.5 h-3.5 text-gray-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
