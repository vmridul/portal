import React, { useState, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Happy01Icon,
  PencilEdit01Icon,
  MoreHorizontalIcon,
  CopyIcon,
  Delete01Icon
} from "@hugeicons/core-free-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as HoverCard from "@radix-ui/react-hover-card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ReactionToolbar } from "./ReactionToolbar";

interface MessageToolbarProps {
  content?: string | null;
  messageId: string;
  onDeleteRequest: (id: string) => void;
  onEditRequest: () => void;
  isCurrentUser: boolean;
}

export const MessageToolbar = ({
  content,
  messageId,
  onDeleteRequest,
  onEditRequest,
  isCurrentUser,
}: MessageToolbarProps) => {
  const [open, setOpen] = useState(false);
  const [hoverCardOpen, setHoverCardOpen] = useState(false);
  const toggleReaction = useMutation(api.reactions.toggleReaction);

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
    setHoverCardOpen(false);
  };

  return (
    <div
      className={`absolute -top-4 right-4 md:right-10 z-[70] transition-opacity flex items-center gap-0.5 bg-theme-base border border-theme-border rounded-[8px] p-0.5 shadow-lg ${open || hoverCardOpen ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
        }`}
    >
      <HoverCard.Root
        openDelay={100}
        closeDelay={300}
        open={hoverCardOpen}
        onOpenChange={setHoverCardOpen}
      >
        <HoverCard.Trigger asChild>
          <button className={`p-1.5 rounded-[6px] transition-colors ${hoverCardOpen ? "bg-theme-hover text-white" : "text-gray-400 hover:text-white hover:bg-theme-hover"}`}>
            <HugeiconsIcon icon={Happy01Icon} className="w-4 h-4" />
          </button>
        </HoverCard.Trigger>

        <HoverCard.Portal>
          <HoverCard.Content
            side="top"
            align="center"
            sideOffset={8}
            className="z-[100] outline-none"
          >
            <ReactionToolbar onSelect={onReactionSelect} />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>

      {isCurrentUser && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEditRequest();
          }}
          className="p-1.5 hover:bg-theme-hover rounded-[6px] transition-colors text-gray-400 hover:text-white"
        >
          <HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4" />
        </button>
      )}

      {(content || isCurrentUser) && (
        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              className={`p-1.5 rounded-[6px] transition-colors ${open ? "bg-theme-hover text-white" : "hover:bg-theme-hover text-gray-400 hover:text-white"
                }`}
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="w-32 bg-theme-base border border-theme-border rounded-[8px] py-1 shadow-xl z-[100] animate-in fade-in duration-100 outline-none"
            >
              {content && (
                <DropdownMenu.Item
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-theme-hover flex items-center gap-2 transition-colors outline-none cursor-pointer"
                >
                  <HugeiconsIcon icon={CopyIcon} className="w-3.5 h-3.5" />
                  Copy
                </DropdownMenu.Item>
              )}
              {isCurrentUser && (
                <DropdownMenu.Item
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    onDeleteRequest(messageId);
                  }}
                  className="px-3 py-1.5 text-xs text-left text-red-400 hover:bg-theme-hover flex items-center gap-2 transition-colors outline-none cursor-pointer"
                >
                  <HugeiconsIcon icon={Delete01Icon} className="w-3.5 h-3.5" />
                  Delete
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
};
