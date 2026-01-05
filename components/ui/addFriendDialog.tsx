import { useState } from "react";
import { sendFriendRequest } from "@/app/actions/sendFriendRequest";
import { toast } from "sonner";

export default function AddFriendDialog({
  setAddFriendDialog,
  user_id,
}: {
  setAddFriendDialog: (value: boolean) => void;
  user_id: string;
}) {
  const [friendId, setFriendId] = useState("");
  return (
    <div
      className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-300`}
    >
      <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#05070d] border-[#313131] border p-6 text-white">
        Add Friend
        <div className=" mt-3 flex text-md gap-2 text-sm items-center">
          <input
            onChange={(e) => setFriendId(e.target.value)}
            required
            className="outline-none border placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
            type="text"
            value={friendId}
            placeholder="Enter User's ID"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6 text-sm">
          <button
            onClick={() => {
              setFriendId("");
              setAddFriendDialog(false);
            }}
            className="ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (friendId) {
                sendFriendRequest(user_id, friendId);
                setFriendId("");
                setAddFriendDialog(false);
              } else {
                toast.info("Please enter a valid user ID");
              }
            }}
            className="bg-white ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
