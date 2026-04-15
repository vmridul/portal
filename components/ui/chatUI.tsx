import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { MessageList } from "./MessageList";
import { ChatInputBar } from "./ChatInputBar";
import { useMessages } from "@/src/hooks/use-messages";
import { useMessageActions, useTypingIndicators } from "@/src/hooks/use-message-actions";
import type { User } from "@/lib/types";

interface ChatUIProps {
  type: "room" | "direct";
  room_id: string;
  user: User | null;
  color: string;
  textColor: string;
  onDeleteRequest: (messageId: string) => void;
}

export function ChatUI({
  type,
  room_id,
  user,
  color,
  textColor,
  onDeleteRequest,
}: ChatUIProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const { messages, isLoading: messagesLoading } = useMessages({
    conversationId: room_id,
  });
  const { typingUsers } = useTypingIndicators(room_id);
  const { clearUnreadCount } = useMessageActions();

  // Re-clear unread count whenever new messages arrive while this room is open.
  useEffect(() => {
    if (messages.length > 0) {
      clearUnreadCount(room_id);
    }
  }, [messages.length, room_id, clearUnreadCount]);

  // Global keydown listeners
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  const handleScrollToBottomReq = useCallback(() => {
    setShouldScrollToBottom(true);
    window.dispatchEvent(new CustomEvent("force-scroll-bottom"));
  }, []);

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  return (
    <div
      className={`flex flex-col items-center relative overflow-hidden ${
        type === "direct" ? "h-[calc(100dvh-55px)]" : "h-[calc(100dvh-40px)]"
      }`}
    >
      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            <Image
              src={previewImage}
              alt="preview"
              fill
              className="object-contain"
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button
            onClick={() => setPreviewImage(null)}
            className={`absolute ${
              isMobile ? "opacity-0 pointer-events-none" : "opacity-100"
            } top-6 right-6 text-white/60 hover:text-white/80 bg-black/50 rounded-full p-2`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      <MessageList
        messages={messages}
        messagesLoading={messagesLoading}
        typingUsers={typingUsers}
        user={user}
        color={color}
        textColor={textColor}
        onPreviewImage={setPreviewImage}
        onDeleteRequest={onDeleteRequest}
        shouldScrollToBottom={shouldScrollToBottom}
        setShouldScrollToBottom={setShouldScrollToBottom}
      />

      <ChatInputBar
        room_id={room_id}
        type={type}
        color={color}
        textColor={textColor}
        scrollToBottom={handleScrollToBottomReq}
      />
    </div>
  );
}

export default ChatUI;
