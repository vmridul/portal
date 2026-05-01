"use client";

import { useCallStore } from "@/store/callStore";
import { useUIStore } from "@/store/uiStore";
import { useCallSessionActions } from "@/hooks";
import { Button } from "@/components/ui/button/Button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mic02Icon,
  MicOff02Icon,
  Video01Icon,
  VideoOffIcon,
  CallEnd01Icon,
} from "@hugeicons/core-free-icons";

export const CallControls = () => {
  const { isMuted, toggleMute, isVideoOn, toggleVideo, callId } = useCallStore();
  const { setCallOverlayOpen } = useUIStore();
  const { leaveCurrentSession } = useCallSessionActions();

  const handleLeave = async () => {
    if (!callId) return;
    try {
      await leaveCurrentSession(callId);
      setCallOverlayOpen(false);
    } catch {
    }
  };

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-theme-base p-3 rounded-2xl flex items-center gap-3 border border-theme-border">
      <Button
        variant={isMuted ? "destructive2" : "other"}
        size="iconLg"
        className="rounded-2xl"
        onClick={toggleMute}
        tooltip={isMuted ? "Unmute" : "Mute"}
        tooltipSide="top"
      >
        <HugeiconsIcon icon={isMuted ? MicOff02Icon : Mic02Icon} className="w-5 h-5" />
      </Button>

      <Button
        variant={isVideoOn ? "other" : "destructive2"}
        size="iconLg"
        className="rounded-2xl"
        onClick={toggleVideo}
        tooltip={isVideoOn ? "Turn Off Video" : "Turn On Video"}
        tooltipSide="top"
      >
        <HugeiconsIcon icon={isVideoOn ? Video01Icon : VideoOffIcon} className="w-5 h-5" />
      </Button>

      <Button
        variant="destructive2"
        size="iconLg"
        className="rounded-2xl"
        onClick={handleLeave}
        tooltip="Leave Call"
        tooltipSide="top"
      >
        <HugeiconsIcon icon={CallEnd01Icon} className="w-5 h-5" />
      </Button>
    </div>
  );
};
