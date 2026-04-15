"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCallback, useState } from "react";

interface SendMessageArgs {
  conversation_id: string;
  conversation_type: "room" | "direct";
  msg: string | null;
  file_storage_id?: string | Id<"_storage">;
  file_type: string | null;
  file_name: string | null;
}

interface DeleteMessageArgs {
  msg_id: Id<"messages">;
}

interface UseMessageActionsResult {
  sendMessage: (args: SendMessageArgs) => Promise<void>;
  deleteMessage: (args: DeleteMessageArgs) => Promise<void>;
  clearUnreadCount: (conversation_id: string) => Promise<void>;
  generateUploadUrl: () => Promise<string>;
  error: Error | null;
}

export function useMessageActions(): UseMessageActionsResult {
  const [error, setError] = useState<Error | null>(null);

  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const deleteMessageMutation = useMutation(api.messages.deleteMessage);
  const clearUnreadCountMutation = useMutation(api.messages.clearUnreadCount);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const sendMessage = useCallback(
    async (args: SendMessageArgs) => {
      const convexArgs = {
        ...args,
        file_storage_id: args.file_storage_id as Id<"_storage"> | undefined,
      };
      await sendMessageMutation(convexArgs);
    },
    [sendMessageMutation]
  );

  const deleteMessage = useCallback(
    async (args: DeleteMessageArgs) => {
      setError(null);
      try {
        await deleteMessageMutation(args);
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [deleteMessageMutation]
  );

  const clearUnreadCount = useCallback(
    async (conversation_id: string) => {
      try {
        await clearUnreadCountMutation({ conversation_id });
      } catch (e) {
        console.error("Failed to clear unread count:", e);
      }
    },
    [clearUnreadCountMutation]
  );

  const generateUploadUrlFn = useCallback(async () => {
    const url = await generateUploadUrl();
    return url;
  }, [generateUploadUrl]);

  return {
    sendMessage,
    deleteMessage,
    clearUnreadCount,
    generateUploadUrl: generateUploadUrlFn,
    error,
  };
}

export function useTypingIndicators(roomId: string) {
  const updateTyping = useMutation(api.typing.updateTyping);
  const removeTyping = useMutation(api.typing.removeTyping);
  const typingUsersQuery = useQuery(api.typing.getTypingUsers, { room_id: roomId });

  const setTyping = useCallback(async () => {
    try {
      await updateTyping({ room_id: roomId });
    } catch (e) {
      console.error("Failed to update typing:", e);
    }
  }, [roomId, updateTyping]);

  const clearTyping = useCallback(async () => {
    try {
      await removeTyping({ room_id: roomId });
    } catch (e) {
      console.error("Failed to clear typing:", e);
    }
  }, [roomId, removeTyping]);

  return {
    typingUsers: typingUsersQuery ?? [],
    setTyping,
    clearTyping,
    isLoading: typingUsersQuery === undefined,
  };
}