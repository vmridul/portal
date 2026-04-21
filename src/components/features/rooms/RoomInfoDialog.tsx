import { formatToIST } from "@/lib/utils/date";
import { toast } from "sonner";
import { useRoomActions } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import { useUserStore } from "@/store/useUserStore";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const RoomInfoDialog = () => {
  const { modalData, closeModal } = useUIStore();
  const user = useUserStore((s) => s.user);
  const { renameRoom } = useRoomActions();

  const { register, handleSubmit, formState: { isSubmitting }, watch } = useForm({
    defaultValues: { newRoomName: modalData?.roomName || "" }
  });

  const newRoomName = watch("newRoomName");

  if (!modalData) return null;
  const { owner_id, ownerName, roomName, createdAt, room_id } = modalData;

  const onRename = async (data: { newRoomName: string }) => {
    try {
      await renameRoom({ room_id, new_name: data.newRoomName });
      closeModal();
      toast.success("Changed room name");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to rename room");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Room Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onRename)} className="flex flex-col gap-4">
          <Input
            {...register("newRoomName", { required: true, minLength: 3, maxLength: 16 })}
            label="Room Name"
            disabled={owner_id !== user?.user_id || isSubmitting}
          />
          <Input label="Room Owner" value={ownerName || "Unknown"} disabled />
          <Input label="Created On" value={formatToIST(createdAt || Date.now())} disabled />
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={newRoomName === roomName || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};