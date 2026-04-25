"use client";

import { useUIStore } from "@/store/uiStore";
import { useCallStore } from "@/store/callStore";
import { useCallSessionActions } from "@/hooks";
import { useUserStore } from "@/store/useUserStore";
import { ConfirmDialog } from "@/components/ui/dialog";

export function CallSwitchModal() {
  const { closeModal, modalData } = useUIStore();
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
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title="Switch Call"
      description="You are already in a call. Joining this one will automatically disconnect you from your current session."
      confirmText="Switch Now"
      onConfirm={handleSwitch}
    />
  );
}