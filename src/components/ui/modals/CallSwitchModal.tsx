"use client";

import { useUIStore } from "@/store/uiStore";
import { useColor } from "@/contexts/colorContext";
import { useCallStore } from "@/store/callStore";
import { useCallSessionActions } from "@/hooks";
import { useUserStore } from "@/store/useUserStore";

export function CallSwitchModal() {
  const { closeModal, modalData } = useUIStore();
  const { color, textColor } = useColor();
  const activeCallId = useCallStore((state) => state.callId);
  const { switchSession } = useCallSessionActions();
  const user = useUserStore((s) => s.user);

  const handleSwitch = async () => {
    const { newCallId, newRoomId, newRoomName, oldCallId } = modalData;
    const currentCallId = oldCallId || activeCallId;

    if (!currentCallId) {
      closeModal();
      return;
    }

    try {
      await switchSession(
        {
          callId: newCallId,
          room: {
            id: newRoomId,
            name: newRoomName,
          },
          user: {
            userId: user?.user_id,
            displayName: user?.username || "Guest",
            avatarUrl: user?.avatar || undefined,
          },
        },
        currentCallId,
      );
      closeModal();
    } catch {
      closeModal();
    }
  };

  return (
    <div className="w-96 md:scale-100 scale-95 rounded-xl bg-theme-surface border-theme-border border p-6 text-white animate-in zoom-in-95 duration-200">
      <div className="text-lg font-medium">Switch Call</div>
      
      <div className="mt-4 text-sm text-white/60 leading-relaxed">
        You are already in a call. Joining this one will automatically disconnect you from your current session.
      </div>

      <div className="flex justify-end gap-2 mt-8 text-sm">
        <button
          type="button"
          onClick={closeModal}
          className="ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSwitch}
          style={{ backgroundColor: color, color: textColor }}
          className="ease-in-out hover:brightness-110 py-2 px-6 rounded-xl transition-all font-medium"
        >
          Switch Now
        </button>
      </div>
    </div>
  );
}
