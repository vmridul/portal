import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useRoomActions } from "@/src/hooks";
import { useUIStore } from "@/store/uiStore";
import { useColor } from "@/contexts/colorContext";
import { generateRoomCode } from "@/app/actions/randomID";
import { toast } from "sonner";

export function CreateRoomModal() {
  const { closeModal } = useUIStore();
  const { color, textColor } = useColor();
  const { createRoom } = useRoomActions();
  const router = useRouter();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { roomName: "" }
  });

  const onSubmit = async (data: { roomName: string }) => {
    if (!data.roomName.trim()) {
      toast.error("Enter a valid room name!");
      return;
    }
    try {
      const generated_id = await generateRoomCode();
      await createRoom({ room_name: data.roomName.trim(), room_id: generated_id.toString() });
      closeModal();
      toast.success("Room created successfully");
      router.push(`/portal/room/${generated_id}`);
    } catch (e) {
      toast.error((e as Error).message || "Failed to create room");
    }
  };

  return (
    <div className="w-96 md:scale-100 scale-95 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white animate-in zoom-in-95 duration-200">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>Create Room</div>
        <div className="mt-3 flex text-md gap-2 text-sm items-center">
          <input
            {...register("roomName", { required: true })}
            className="outline-none border placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
            type="text"
            placeholder="Room Name"
            disabled={isSubmitting}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 mt-6 text-sm">
          <button
            type="button"
            onClick={closeModal}
            className="ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ backgroundColor: color, color: textColor }}
            className="ease-in-out hover:brightness-110 py-2 px-6 rounded-xl disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
