import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useRoomActions } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import { generateRoomCode } from "@/app/actions/randomID";
import { toast } from "sonner";
import { FormDialog } from "../dialog";
import { Input } from "../input";

export function CreateRoomModal() {
  const { closeModal } = useUIStore();
  const { createRoom } = useRoomActions();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { roomName: "" },
  });

  const onSubmit = async (data: { roomName: string }) => {
    if (!data.roomName.trim()) {
      toast.error("Enter a valid room name!");
      return;
    }
    try {
      const generated_id = await generateRoomCode();
      await createRoom({
        room_name: data.roomName.trim(),
        room_id: generated_id.toString(),
      });
      closeModal();
      toast.success("Room created successfully");
      router.push(`/portal/room/${generated_id}`);
    } catch (e) {
      toast.error((e as Error).message || "Failed to create room");
    }
  };

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title="Create Room"
      onSubmit={handleSubmit(onSubmit)}
      submitText="Create"
      loading={isSubmitting}
    >
      <Input
        {...register("roomName", { required: true })}
        label="Room Name"
        placeholder="Room Name"
        inputSize="sm"
        autoFocus
      />
    </FormDialog>
  );
}
