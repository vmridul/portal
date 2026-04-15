import { useUIStore } from "@/store/uiStore";
import { useState } from "react";
import { useColor } from "@/contexts/colorContext";
import { useUserStore } from "@/store/useUserStore";
import { ChatUI } from "./chatUI";
import { ChatSkeleton } from "./chatSkeleton";
import { useMessageActions } from "@/src/hooks";
import { getDirectConversationId } from "@/lib/utils/message";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export default function ActiveFriendPage() {
  const { activeFriendPage } = useUIStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const { color, textColor } = useColor();
  const user = useUserStore((s) => s.user);
  const { deleteMessage } = useMessageActions();

  const conversationId = activeFriendPage && user?.user_id 
    ? getDirectConversationId(activeFriendPage, user.user_id)
    : null;

  const onDelete = async () => {
    if (!messageToDelete) return;

    try {
      await deleteMessage({
        msg_id: messageToDelete as Id<"messages">,
      });
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
      toast.success("Message deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete message");
    }
  };

  const handleDeleteRequest = (id: string) => {
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div
        className={`fixed ${deleteDialogOpen ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-95"} inset-0 bg-black bg-opacity-35 z-[9999] flex items-center justify-center transition-all duration-200`}
      >
        <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white">
          Are you sure you want to Delete this message?
          <div className="text-[#676767] mt-2 text-sm">
            You won&apos;t be able to revert this action.
          </div>
          <div className="flex justify-end gap-2 mt-6 text-sm">
            <button
              onClick={() => {
                setDeleteDialogOpen(false);
                setMessageToDelete(null);
              }}
              className=" ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="bg-[#ae4347] ease-in-out hover:bg-gray-100 text-white py-2 px-6 rounded-xl"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="">
        {!user || !activeFriendPage ? (
          <ChatSkeleton />
        ) : (
          <div className="w-full">
            <ChatUI
              type="direct"
              room_id={conversationId || ""}
              user={user}
              color={color}
              textColor={textColor}
              onDeleteRequest={handleDeleteRequest}
            />
          </div>
        )}
      </div>
    </>
  );
}