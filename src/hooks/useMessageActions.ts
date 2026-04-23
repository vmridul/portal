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
  file_size?: number;
}

interface DeleteMessageArgs {
  msg_id: Id<"messages">;
}

interface UseMessageActionsResult {
  sendMessage: (args: SendMessageArgs) => Promise<void>;
  deleteMessage: (args: DeleteMessageArgs) => Promise<void>;
  clearUnreadCount: (conversation_id: string) => Promise<void>;
  generateUploadUrl: () => Promise<string>;
  updateMessage: (args: { msg_id: Id<"messages">; content: string }) => Promise<void>;
}

export function useMessageActions(): UseMessageActionsResult {
  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const deleteMessageMutation = useMutation(api.messages.deleteMessage);
  const clearUnreadCountMutation = useMutation(api.messages.clearUnreadCount);
  const generateUploadUrlMutation = useMutation(api.storage.generateUploadUrl);
  const updateMessageMutation = useMutation(api.messages.updateMessage);

  const sendMessage = useCallback(
    async (args: SendMessageArgs) => {
      const convexArgs = {
        ...args,
        file_storage_id: args.file_storage_id as Id<"_storage"> | undefined,
      };
      await sendMessageMutation(convexArgs);
    },
    [sendMessageMutation],
  );

  const deleteMessage = useCallback(
    async (args: DeleteMessageArgs) => {
      await deleteMessageMutation(args);
    },
    [deleteMessageMutation],
  );

  const clearUnreadCount = useCallback(
    async (conversation_id: string) => {
      try {
        await clearUnreadCountMutation({ conversation_id });
      } catch (e) {
        console.error("Failed to clear unread count:", e);
      }
    },
    [clearUnreadCountMutation],
  );

  const generateUploadUrl = useCallback(async () => {
    return generateUploadUrlMutation();
  }, [generateUploadUrlMutation]);

  const updateMessage = useCallback(async (args: { msg_id: Id<"messages">; content: string }) => {
    await updateMessageMutation(args);
  }, [updateMessageMutation]);

  return {
    sendMessage,
    deleteMessage,
    clearUnreadCount,
    generateUploadUrl,
    updateMessage,
  };
}

export function useTypingIndicators(roomId: string) {
  const updateTyping = useMutation(api.typing.updateTyping);
  const removeTyping = useMutation(api.typing.removeTyping);
  const typingUsersQuery = useQuery(api.typing.getTypingUsers, {
    room_id: roomId,
  });

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
