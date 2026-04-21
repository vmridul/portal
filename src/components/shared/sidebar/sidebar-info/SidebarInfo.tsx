"use client";

import { useState, useEffect } from "react";
import {
  SidebarLayout,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useRoomActions } from "@/hooks";
import { formatDateFull } from "@/lib/utils/date";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SidebarInfoProps {
  id: string;
  type: "room";
  room: any;
  members: any[];
  currentUser: any;
  isLoading: boolean;
  onClose: () => void;
}

export function SidebarInfo({
  id,
  type,
  room,
  members,
  currentUser,
  isLoading,
  onClose,
}: SidebarInfoProps) {
  const { renameRoom } = useRoomActions();
  const [editedName, setEditedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (room?.room_name) {
      setEditedName(room.room_name);
    }
  }, [room?.room_name]);

  const isOwner = room?.owner_id === currentUser?.user_id;
  const owner = members?.find((m) => m.role === "owner");
  const ownerName = owner?.Users?.username || "Unknown";

  const handleRename = async () => {
    if (!editedName.trim() || editedName === room?.room_name) return;
    try {
      setIsSubmitting(true);
      await renameRoom({ room_id: id, new_name: editedName });
      toast.success("Room name updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to rename room");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSave =
    isOwner &&
    editedName.trim() &&
    editedName !== room?.room_name &&
    editedName.length >= 3 &&
    editedName.length <= 16;

  return (
    <SidebarLayout>
      <SidebarHeader title="Room Info" onClose={onClose} />
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20">
            <div className="w-full h-full rounded-[24px] bg-white text-theme-base flex items-center justify-center text-3xl font-bold shadow-xl">
              {room?.room_name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">{room?.room_name}</h2>
            <p className="text-xs text-white/40">ID: {id}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm">
          <Input
            label="Room Name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            disabled={!isOwner || isSubmitting}
            placeholder="Room Name"
          />
          <Input label="Room Owner" value={ownerName} disabled />
          <Input
            label="Created On"
            value={
              isLoading
                ? "Loading..."
                : formatDateFull(room?._creationTime || 0)
            }
            disabled
          />
        </div>
      </div>
      <SidebarFooter>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setEditedName(room?.room_name || "")}
            disabled={
              isSubmitting ||
              editedName === room?.room_name ||
              !editedName.trim()
            }
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="other"
            onClick={handleRename}
            disabled={isSubmitting || !canSave}
            loading={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </SidebarFooter>
    </SidebarLayout>
  );
}
