import { formatToIST } from "@/lib/utils/date";
import { toast } from "sonner";
import { useRoomActions } from "@/hooks";
import { useColor } from "@/contexts/colorContext";
import { useUIStore } from "@/store/uiStore";
import { useUserStore } from "@/store/useUserStore";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

export const RoomInfoDialog = () => {
  const { modalData, closeModal } = useUIStore();
  const user = useUserStore((s) => s.user);
  const { renameRoom } = useRoomActions();
  const { color, textColor } = useColor();

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
    <div className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-200 animate-in fade-in-0`}>
      <form
        onSubmit={handleSubmit(onRename)}
        className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white animate-in zoom-in-95 duration-200"
      >
        Room Information
        <div className=" mt-3 flex flex-col gap-2 text-sm">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Room Name</span>
            <input
              {...register("newRoomName", { required: true, minLength: 3, maxLength: 16 })}
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
              type="text"
              disabled={owner_id !== user?.user_id || isSubmitting}
              placeholder="Room Name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Room Owner</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
              type="text"
              disabled
              value={ownerName || "Unknown"}
              placeholder="Room Owner"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Created On</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
              type="text"
              disabled
              value={formatToIST(createdAt || Date.now())}
              placeholder="Room Owner"
            />
          </div>
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
            disabled={newRoomName === roomName || isSubmitting}
            style={{ backgroundColor: color, color: textColor }}
            className="disabled:opacity-50 ease-in-out py-2 px-6 rounded-xl"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};
