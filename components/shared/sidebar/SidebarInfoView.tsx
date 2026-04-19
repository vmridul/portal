"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { useRoomActions } from "@/hooks";
import { formatDateFull } from "@/lib/utils/date";
import { toast } from "sonner";
import { useColor } from "@/contexts/colorContext";

interface SidebarInfoViewProps {
  id: string;
  type: "room";
  room: any;
  members: any[];
  currentUser: any;
  isLoading: boolean;
}

export function SidebarInfoView({ id, type, room, members, currentUser, isLoading }: SidebarInfoViewProps) {
  const { color, textColor } = useColor();
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

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-8">
        {/* Branding Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative w-20 h-20">
            <div className="w-full h-full rounded-[24px] bg-white text-theme-base flex items-center justify-center text-3xl font-bold shadow-xl">
              {room?.room_name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">
              {room?.room_name}
            </h2>
            <p className="text-xs text-white/40 flex items-center justify-center gap-1 ">
              ID: {id}
            </p>
          </div>
        </div>

        {/* Info Tab Contextual Fields */}
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Room Name</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
              type="text"
              disabled={!isOwner || isSubmitting}
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Room Name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Room Owner</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
              type="text"
              disabled
              value={ownerName}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Created On</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
              type="text"
              disabled
              value={isLoading ? "Loading..." : formatDateFull(room?._creationTime || 0)}
            />
          </div>
        </div>
      </div>

      {/* Bottom Actions for Rooms */}
      {isOwner && editedName !== room?.room_name && (
        <div className="p-4 bg-theme-base flex justify-end gap-2 text-xs">
          <button
            onClick={() => setEditedName(room?.room_name || "")}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-[8px] border border-theme-border text-gray-300 hover:bg-theme-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={isSubmitting || editedName.length < 3 || editedName.length > 16}
            style={{ backgroundColor: color, color: textColor }}
            className="px-6 py-2 rounded-[8px] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
