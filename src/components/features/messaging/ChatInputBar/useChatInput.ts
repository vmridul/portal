import { useState, useCallback, useEffect, useRef } from "react";
import { useMessageActions, useTypingIndicators } from "@/hooks/useMessageActions";
import { useUIStore } from "@/store/uiStore";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useFileUpload } from "./useFileUpload";
import type { ChatInputBarProps } from "./types";

export function useChatInput({
  room_id,
  type,
  scrollToBottom,
}: Pick<ChatInputBarProps, "room_id" | "type" | "scrollToBottom">) {
  const [msg, setMsg] = useState("");

  const { setTyping, clearTyping } = useTypingIndicators(room_id);
  const { sendMessage, generateUploadUrl, updateMessage } = useMessageActions();
  const { editingMessage, setEditingMessage } = useUIStore();


  // File upload hook
  const {
    upload,
    startUpload,
    handleFileSelect,
    cancelUpload,
    previewUrl,
    fileInputRef,
  } = useFileUpload(generateUploadUrl);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Populate edit mode
  useEffect(() => {
    if (editingMessage) {
      setMsg(editingMessage.content);
      inputRef.current?.focus();
    } else {
      setMsg("");
    }
  }, [editingMessage]);

  // Global '/' shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMsg(e.target.value);
      if (e.target.value.trim()) {
        setTyping();
      } else {
        clearTyping();
      }
    },
    [setTyping, clearTyping],
  );

  const onEmojiClick = useCallback(
    (emojiData: { emoji: string }) => {
      const textarea = inputRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = msg.slice(0, start) + emojiData.emoji + msg.slice(end);
      setMsg(newText);
      const newCursorPos = start + emojiData.emoji.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [msg],
  );

  const handleSendMessage = useCallback(async () => {
    if (!msg.trim() && !upload.file) return;

    // Editing flow
    if (editingMessage) {
      if (!msg.trim() || msg === editingMessage.content) {
        setEditingMessage(null);
        return;
      }
      try {
        await updateMessage({
          msg_id: editingMessage.id as Id<"messages">,
          content: msg,
        });
        setEditingMessage(null);
        setMsg("");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update message");
      }
      return;
    }

    let storageId = upload.storageId;

    if (upload.file && !storageId) {
      if (upload.isUploading) {
        toast.info("Waiting for upload to finish...");
        // Upload is in progress; we cannot send until it completes.
        // For simplicity, abort send and rely on user to retry after upload finishes.
        return;
      } else {
        await startUpload(upload.file);
        storageId = upload.storageId;
      }
    }

    try {
      await sendMessage({
        conversation_id: room_id,
        conversation_type: type,
        msg: msg || null,
        file_storage_id: storageId || undefined,
        file_type: upload.file?.type || null,
        file_name: upload.file?.name || null,
        file_size: upload.file?.size,
      });
      setMsg("");
      // Reset upload state via hook
      cancelUpload();
      scrollToBottom();
      await clearTyping();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  }, [
    msg,
    upload,
    room_id,
    type,
    sendMessage,
    startUpload,
    clearTyping,
    scrollToBottom,
    editingMessage,
    setEditingMessage,
    updateMessage,
    cancelUpload,
  ]);


return {
  input: {
    ref: inputRef,
    value: msg,
    onChange: handleInputChange,
    onEmojiClick,
  },
  file: {
    ref: fileInputRef,
    previewUrl,
    upload,
    onSelect: handleFileSelect,
    onCancel: cancelUpload,
    onStart: startUpload,
  },
  actions: {
    onSend: handleSendMessage,
    onClearTyping: clearTyping,
  },
  editing: {
    message: editingMessage,
    onCancel: () => setEditingMessage(null),
  },
} as const;
}
