import { createPortal } from "react-dom";
import { useRoomActions } from "@/hooks";
import { toast } from "sonner";
import { useUIStore } from "@/store/uiStore";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

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
      router.replace('/portal');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed action");
    }
  };

  return createPortal(
    <div
      className={`fixed font-sans bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-300 animate-in fade-in-0`}
    >
      <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#06070d] border-theme-border border p-6 text-white/90 animate-in zoom-in-95 duration-200">
        <span>{`${isOwner
          ? "Are you sure you want to delete the room "
          : "Are you sure you want to leave the room "
          }`}</span>
        <span className="font-bold text-white">{roomName} ?</span>
        <div className="text-[#818181] mt-2 text-sm">
          {`${isOwner
            ? "You won't be able to revert this action!"
            : "You can join back anytime using the Room ID."
            }`}
        </div>
        <div className="flex justify-end gap-2 mt-6 text-sm">
          <button
            onClick={closeModal}
            className="bg-theme-base ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={onAction}
            className="bg-[#ae4447] ease-in-out hover:bg-[#ae4447]/90 text-white py-2 px-6 rounded-xl"
          >
            {`${isOwner ? "Delete" : "Leave"}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
