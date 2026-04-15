"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useColor } from "@/contexts/colorContext";
import { useUserStore } from "@/store/useUserStore";
import { ChatUI } from "@/components/features/messaging/ChatUI";
import { ChatSkeleton } from "@/components/shared/skeletons/ChatSkeleton";
import { useMessageActions } from "@/hooks";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export default function Room({ room_id }: { room_id: string }) {
  const router = useRouter();
  const { deleteMessage } = useMessageActions();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const user = useUserStore((s) => s.user);
  const { color, textColor } = useColor();

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
      toast.error((e as Error).message || "Failed to delete message");
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 ${deleteDialogOpen ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-95"} bg-black bg-opacity-35 z-[9999] flex items-center justify-center transition-all duration-200`}
      >
        <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white">
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
              className="ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="bg-[#ae4347] ease-in-out hover:bg-[#9a3a3d] text-white py-2 px-6 rounded-xl"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {!user?.user_id ? (
        <ChatSkeleton />
      ) : (
        <ChatUI
          type="room"
          room_id={room_id}
          user={user}
          color={color}
          textColor={textColor}
          onDeleteRequest={(id) => {
            setMessageToDelete(id);
            setDeleteDialogOpen(true);
          }}
        />
      )}
    </>
  );
}