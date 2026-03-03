import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useColor } from "@/contexts/colorContext";

export default function AddFriendDialog({
  setAddFriendDialog,
  user_id,
}: {
  setAddFriendDialog: (value: boolean) => void;
  user_id: string;
}) {
  const [friendId, setFriendId] = useState("");
  const sendRequest = useMutation(api.friends.sendRequest);
  const { color, textColor } = useColor();

  const handleSend = async () => {
    if (!friendId) {
      toast.info("Please enter a valid user ID");
      return;
    }

    try {
      await sendRequest({ receiver_id: friendId });
      toast.success("Friend request sent!");
      setFriendId("");
      setAddFriendDialog(false);
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || "Failed to send request";
      const serverMatch = msg.match(/Server Error\s+(.*?)\s+at handler/);
      const uncaughtMatch = msg.match(/Uncaught Error:\s*(.*)/);

      toast.error(serverMatch ? serverMatch[1] : (uncaughtMatch ? uncaughtMatch[1] : msg));
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
            className="ease-in-out py-2 px-6 rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
