import { useState } from "react";
import { toast } from "sonner";
import { useFriendActions } from "@/src/hooks";
import { useColor } from "@/contexts/colorContext";

interface AddFriendDialogProps {
  setAddFriendDialog: (value: boolean) => void;
  user_id: string;
}

export default function AddFriendDialog({
  setAddFriendDialog,
}: AddFriendDialogProps) {
  const [friendId, setFriendId] = useState("");
  const { sendRequest } = useFriendActions();
  const { color, textColor } = useColor();

  const handleSend = async () => {
    if (!friendId) {
      toast.info("Please enter a valid user ID");
      return;
    }

    try {
      await sendRequest(friendId);
      toast.success("Friend request sent!");
      setFriendId("");
      setAddFriendDialog(false);
    } catch (e) {
      const msg = (e as Error).message || "Failed to send request";
      toast.error(msg);
    }
  };

  return (
    <div
      className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-300`}
    >
      <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white">
        Add Friend
        <div className=" mt-3 flex text-md gap-2 text-sm items-center">
          <input
            onChange={(e) => setFriendId(e.target.value)}
            required
            className="outline-none border placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
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
            className="ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            style={{ backgroundColor: color, color: textColor }}
            className="ease-in-out hover:brightness-110 py-2 px-6 rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}