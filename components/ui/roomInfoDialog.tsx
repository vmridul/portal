import { formatToIST } from "@/lib/utils/date";
import { toast } from "sonner";
import { useRoomActions } from "@/src/hooks";
import { useColor } from "@/contexts/colorContext";
import type { User } from "@/lib/types";

interface RoomInfoDialogProps {
  setInfoDialog: (value: boolean) => void;
  owner_id: string;
  ownerName: string;
  roomName: string;
  createdAt: number;
  newRoomName: string;
  setNewRoomName: (value: string) => void;
  user: User | null;
  room_id: string;
}

export const RoomInfoDialog = ({
  setInfoDialog,
  owner_id,
  ownerName,
  roomName,
  createdAt,
  newRoomName,
  setNewRoomName,
  user,
  room_id,
}: RoomInfoDialogProps) => {
  const { renameRoom } = useRoomActions();
  const { color, textColor } = useColor();

  const onRename = async () => {
    try {
      await renameRoom({ room_id, new_name: newRoomName });
      setNewRoomName(newRoomName);
      setInfoDialog(false);
      toast.success("Changed room name");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to rename room");
    }
  };
  return (
    <div
      className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-200`}
    >
      <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white">
        Room Information
        <div className=" mt-3 flex flex-col gap-2 text-sm">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Room Name</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
              type="text"
              disabled={owner_id != user?.user_id}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room Name"
              minLength={3}
              maxLength={16}
              value={newRoomName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Room Owner</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
              type="text"
              disabled
              value={ownerName}
              placeholder="Room Owner"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Created On</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
              type="text"
              disabled
              value={formatToIST(createdAt)}
              placeholder="Room Owner"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6 text-sm">
          <button
            onClick={() => {
              setInfoDialog(false);
              setNewRoomName(roomName);
            }}
            className="ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
          >
            Cancel
          </button>
          <button
            disabled={newRoomName === roomName}
            onClick={onRename}
            style={{ backgroundColor: color, color: textColor }}
            className="disabled:opacity-50 ease-in-out py-2 px-6 rounded-xl"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
