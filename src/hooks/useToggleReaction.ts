import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook that returns a function to toggle a reaction on a message.
 * It abstracts the Convex mutation away from UI components.
 */
export const useToggleReaction = () => {
  const toggle = useMutation(api.reactions.toggleReaction);
  return (messageId: string, emoji: string) => {
    return toggle({
      messageId: messageId as Id<"messages">,
      emoji,
    });
  };
};
