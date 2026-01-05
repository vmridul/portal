import { formatToIST } from "@/app/actions/formatToIST";
import { UUID } from "crypto";
export const RoomInfoDialog = ({
  setInfoDialog,
  owner_id,
  ownerName,
  roomName,
  createdAt,
  newRoomName,
  setNewRoomName,
  user,
  handleChangeRoomName,
  room_id,
}: {

  setInfoDialog: (value: boolean) => void;
  owner_id: UUID;
  ownerName: string;
  roomName: string;
  createdAt: Date;
  newRoomName: string;
  setNewRoomName: (value: string) => void;
  user: any;
  handleChangeRoomName: (value: any) => void;
  room_id: string;
}) => {
  return (
    <div
      className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-200`}
    >
      <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#05070d] border-[#313131] border p-6 text-white">
        Room Information
        <div className=" mt-3 flex flex-col gap-2 text-sm">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Room Name</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
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
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
              type="text"
              disabled
              value={ownerName}
              placeholder="Room Owner"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Created On</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
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
            className="ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
          >
            Cancel
          </button>
          <button
            disabled={newRoomName === roomName}
            onClick={() => {
              handleChangeRoomName({
                room_id,
                newRoomName,
                setInfoDialog,
                setNewRoomName,
              });
            }}
            className="bg-white disabled:opacity-50 ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
          >
            Change Name
          </button>
        </div>
      </div>
    </div>
  );
};
