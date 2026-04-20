import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useRoomActions } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import { useColor } from "@/contexts/colorContext";
import { toast } from "sonner";

export function JoinRoomModal() {
  const { closeModal } = useUIStore();
  const { color, textColor } = useColor();
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
    <div className="w-96 md:scale-100 scale-95 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white animate-in zoom-in-95 duration-200">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>Join Room</div>
        <div className="mt-3 flex text-md gap-2 text-sm items-center">
          <input
            {...register("roomId", { required: true, minLength: 4 })}
            className="outline-none border placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
            type="text"
            placeholder="Room ID"
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
            {isSubmitting ? "Joining..." : "Join"}
          </button>
        </div>
      </form>
    </div>
  );
}
