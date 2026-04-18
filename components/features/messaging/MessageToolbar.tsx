import React, { useState, useRef } from "react";
import { Smile, Pencil, MoreHorizontal, Copy, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ReactionToolbar } from "./ReactionToolbar";

interface MessageToolbarProps {
  content?: string | null;
  messageId: string;
  onDeleteRequest: (id: string) => void;
  isCurrentUser: boolean;
}

export const MessageToolbar = ({
  content,
  messageId,
  onDeleteRequest,
  isCurrentUser,
}: MessageToolbarProps) => {
  const [open, setOpen] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toggleReaction = useMutation(api.reactions.toggleReaction);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 200);
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setOpen(false);
    }
  };

  const onReactionSelect = async (emoji: string) => {
    await toggleReaction({
      messageId: messageId as Id<"messages">,
      emoji,
    });
    setShowReactions(false);
  };

  return (
    <div
      className={`absolute -top-4 right-4 md:right-10 z-[70] transition-opacity flex items-center gap-0.5 bg-theme-base border border-theme-border rounded-[8px] p-0.5 shadow-lg ${open || showReactions ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
        }`}
    >
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className={`p-1.5 rounded-[6px] transition-colors ${showReactions ? "bg-theme-hover text-white" : "text-gray-400 hover:text-white hover:bg-theme-hover"}`}>
          <Smile className="w-4 h-4" />
        </button>

        {showReactions && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
            <ReactionToolbar onSelect={onReactionSelect} />
          </div>
        )}
      </div>

      {isCurrentUser && (
        <button className="p-1.5 hover:bg-theme-hover rounded-[6px] transition-colors text-gray-400 hover:text-white">
          <Pencil className="w-4 h-4" />
        </button>
      )}

      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            className={`p-1.5 rounded-[6px] transition-colors ${open ? "bg-theme-hover text-white" : "hover:bg-theme-hover text-gray-400 hover:text-white"
              }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={8}
            align="end"
            className="w-32 bg-theme-base border border-theme-border rounded-[8px] py-1 shadow-xl z-[100] animate-in fade-in zoom-in duration-100 outline-none"
          >
            <DropdownMenu.Item
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-theme-hover flex items-center gap-2 transition-colors outline-none cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDeleteRequest(messageId);
              }}
              className="px-3 py-1.5 text-xs text-left text-red-400 hover:bg-theme-hover flex items-center gap-2 transition-colors outline-none cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};
