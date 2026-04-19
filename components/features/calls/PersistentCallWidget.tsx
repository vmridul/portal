"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Mic01Icon, MicOff01Icon, CallEnd01Icon } from "@hugeicons/core-free-icons";
import { useCallStore } from "@/store/callStore";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { useCallSessionActions, useCalls } from "@/hooks";
import { memo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AvatarStack from "@/components/shared/AvatarStack";

const PersistentCallWidget = () => {
  const { isJoined, roomName, actualRoomId, callId, isMuted, toggleMute } = useCallStore();
  const { setSidebarOpen, setSidebarTab } = useUIStore();
  const { leaveCurrentSession } = useCallSessionActions();
  const router = useRouter();
  const { activeCalls } = useCalls(actualRoomId || "");
  const activeCall = activeCalls.find((call) => call._id === callId);
  const participantProfiles =
    useQuery(
      api.users.getUsersByExternalIds,
      activeCall
        ? {
            user_ids: activeCall.participants,
          }
        : "skip",
    ) || [];

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
      if (actualRoomId.startsWith("direct_")) {
        router.push("/portal");
      } else {
        router.push(`/portal/room/${actualRoomId}`);
      }
      setSidebarOpen(true);
      setSidebarTab("calls");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex justify-between bg-theme-hover items-center cursor-pointer ease-in-out rounded-lg w-60 px-3 py-2 group"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 text-gray-100">
        <span className="truncate text-sm font-medium max-w-[96px]">
          {roomName || "Current Call"}
        </span>
        <div className="min-w-0 flex-1">
          <AvatarStack users={participantProfiles} size={20} limit={3} />
        </div>
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
          {isMuted ? <HugeiconsIcon icon={MicOff01Icon} className="w-4 h-4" /> : <HugeiconsIcon icon={Mic01Icon} className="w-4 h-4" />}
        </button>

        <button
          onClick={handleLeave}
          className="p-2 rounded-xl bg-red-800 text-red-100 hover:bg-red-900 transition-all duration-200"
          title="Leave Call"
        >
          <HugeiconsIcon icon={CallEnd01Icon} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default memo(PersistentCallWidget);
