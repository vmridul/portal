import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useRoomActions } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import { toast } from "sonner";
import { FormDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function JoinRoomModal() {
  const { closeModal } = useUIStore();
  const { joinRoom } = useRoomActions();
  const router = useRouter();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { roomId: "" }
  });

  const onSubmit = async (data: { roomId: string }) => {
    if (!data.roomId.trim()) {
      toast.error("Enter a Room ID!");
      return;
    }
    try {
      await joinRoom({ room_id: data.roomId.trim() });
      closeModal();
      toast.success("Room joined successfully");
      router.replace(`/portal/room/${data.roomId.trim()}`);
    } catch (e) {
      const msg = (e as Error).message || "Failed to join room";
      if (msg.includes("already in this room")) {
        toast.info("You are already in this room");
        closeModal();
        router.replace(`/portal/room/${data.roomId.trim()}`);
      } else {
        toast.error("Failed to join room");
      }
    }
  };

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title="Join Room"
      onSubmit={handleSubmit(onSubmit)}
      submitText="Join"
      loading={isSubmitting}
    >
      <Input
        {...register("roomId", { required: true, minLength: 4 })}
        label="Room ID"
        placeholder="Room ID"
        autoFocus
      />
    </FormDialog>
  );
}