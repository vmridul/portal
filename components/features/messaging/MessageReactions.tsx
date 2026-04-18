import React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Reaction {
  _id: string;
  user_id: string;
  emoji: string;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  currentUserId: string;
}

export const MessageReactions = ({
  messageId,
  reactions,
  currentUserId,
}: MessageReactionsProps) => {
  const toggleReaction = useMutation(api.reactions.toggleReaction);

  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        count: 0,
        hasUserReacted: false,
        userIds: [],
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].userIds.push(reaction.user_id);
    if (reaction.user_id === currentUserId) {
      acc[reaction.emoji].hasUserReacted = true;
    }
    return acc;
  }, {} as Record<string, { count: number; hasUserReacted: boolean; userIds: string[] }>);

  const handleReactionClick = async (emoji: string) => {
    await toggleReaction({
      messageId: messageId as Id<"messages">,
      emoji,
    });
  };

  return (
    <div className="flex flex-wrap gap-1 p-1">
      {Object.entries(groupedReactions).map(([emoji, data]) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all
            ${data.hasUserReacted
              ? "bg-theme-hover hover:bg-theme-base border border-theme-border text-white shadow-sm"
              : "bg-theme-surface/50 border border-theme-border  text-gray-400 hover:bg-theme-hover hover:text-white"
            }
          `}
          title={emoji}
        >
          <span>{emoji}</span>
          {data.count > 0 && (
            <span className={data.hasUserReacted ? "text-white font-medium" : "text-gray-500"}>
              {data.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
