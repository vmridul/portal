import { useRoomActions } from "@/hooks";
import { toast } from "sonner";
import { useUIStore } from "@/store/uiStore";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { ConfirmDialog } from "@/components/ui/dialog";

export const LeaveDialog = () => {
  const { modalData, closeModal } = useUIStore();
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  if (!modalData) return null;
  const { roomName, room_id, owner_id } = modalData;

  const isOwner = String(owner_id) === String(user?.user_id);
  const { deleteRoom, leaveRoom } = useRoomActions();

  const onAction = async () => {
    try {
      if (isOwner) {
        await deleteRoom({ room_id });
        toast.success("Room deleted");
      } else {
        await leaveRoom({ room_id });
        toast.success("Left room");
      }
      closeModal();
      router.replace("/portal");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed action");
    }
  };

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title={isOwner ? `Delete the room "${roomName}"?` : `Leave the room "${roomName}"?`}
      description={
        isOwner
          ? "You won't be able to revert this action!"
          : "You can join back anytime using the Room ID."
      }
      confirmText={isOwner ? "Delete" : "Leave"}
      variant="destructive"
      onConfirm={onAction}
    />
  );
};