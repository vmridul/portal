import { handleDeleteRoom } from "@/app/actions/deleteRoom";
import { handleLeaveRoom } from "@/app/actions/leaveRoom";
import { User } from "@/store/useUserStore";
import { UUID } from "crypto";
import { createPortal } from "react-dom";

export const LeaveDialog = ({
  owner_id,
  user,
  roomName,
  room_id,
  setLeaveDialog,
  router,
}: {
  owner_id: UUID;
  user: User | null;
  roomName: string;
  room_id: string;
  setLeaveDialog: (value: boolean) => void;
  router: any;
}) => {
  const isOwner = String(owner_id) === String(user?.user_id);
  console.log(typeof owner_id, typeof user?.user_id);
  return (
    <>
      {createPortal(
        <div
          className={`fixed font-sans bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-300`}
        >
          <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#080f17] border-[#313131] border p-6 text-white/90">
            <span>{`${
              isOwner
                ? "Are you sure you want to delete the room "
                : "Are you sure you want to leave the room "
            }`}</span>
            <span className="font-bold text-white">{roomName} ?</span>
            <div className="text-[#818181] mt-2 text-sm">
              {`${
                isOwner
                  ? "You won't be able to revert this action!"
                  : "You can join back anytime using the Room ID."
              }`}
            </div>
            <div className="flex justify-end gap-2 mt-6 text-sm">
              <button
                onClick={() => setLeaveDialog(false)}
                className="bg-[#080f17] ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={
                  isOwner
                    ? () => handleDeleteRoom({ room_id, router })
                    : () =>
                        handleLeaveRoom({
                          room_id,
                          user,
                          setLeaveDialog,
                          router,
                        })
                }
                className="bg-[#ae4447] ease-in-out hover:bg-[#ae4447]/90 text-white py-2 px-6 rounded-xl"
              >
                {`${isOwner ? "Delete" : "Leave"}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
