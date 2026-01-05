"use client";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { useColor } from "@/contexts/colorContext";
import { useUserStore } from "@/store/useUserStore";
import { handleMsgDelete } from "@/app/actions/msgDelete";
import { ChatUI } from "./ui/chatUI";
import { ChatSkeleton } from "./ui/chatSkeleton";

export default function Room({ room_id }: { room_id: string }) {
  const [messages, setMessages] = useState<Array<any>>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { color } = useColor();
  const user = useUserStore((s) => s.user);

  return (
    <>

      <div
        className={`fixed inset-0 ${deleteDialogOpen ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-95"} bg-black bg-opacity-35 z-[9999] flex items-center justify-center transition-all duration-200`}
      >
        <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#05070d] border-[#313131] border p-6 text-white">
          Are you sure you want to Delete this message?
          <div className="text-[#676767] mt-2 text-sm">
            You won't be able to revert this action.
          </div>
          <div className="flex justify-end gap-2 mt-6 text-sm">
            <button
              onClick={() => {
                setDeleteDialogOpen(false);
                setMessageToDelete(null);
              }}
              className="ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleMsgDelete({
                  type: "room",
                  messageToDelete,
                  user,
                  setDeleteDialogOpen,
                  setMessageToDelete,
                })
              }
              className="bg-[#ae4347] ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-white py-2 px-6 rounded-xl"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {!user?.user_id || !messages ? (
        <ChatSkeleton />
      ) : (
        <ChatUI
          type="room"
          messages={messages}
          setMessages={setMessages}
          room_id={room_id}
          user={user}
          color={color}
          setMessageToDelete={setMessageToDelete}
          setDeleteDialogOpen={setDeleteDialogOpen}
          onLoad={() => setLoading(false)}
        />
      )}
    </>
  );
}
