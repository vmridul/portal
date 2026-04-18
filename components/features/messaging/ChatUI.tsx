import React, { useState, useEffect, useCallback } from "react";
import { MessageList } from "./MessageList";
import { ChatInputBar } from "./ChatInputBar";
import { useMessages } from "@/hooks/useMessages";
import { useMessageActions, useTypingIndicators } from "@/hooks/useMessageActions";
import type { User } from "@/lib/types";
import { MediaLightbox } from "@/components/shared/MediaLightbox";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

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
  const { openLightbox } = useUIStore();
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const { messages, status, loadMore, isLoading: messagesLoading } = useMessages({
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

  const handleScrollToBottomReq = useCallback(() => {
    setShouldScrollToBottom(true);
  }, []);

  const handlePreviewMedia = useCallback((url: string) => {
    // Collect all media from current messages for the lightbox gallery
    const mediaItems = messages
      .filter(m => (m.type?.startsWith("image/") || m.type?.startsWith("video/")) && m.file_url)
      .map(m => ({
        file_url: m.file_url as string,
        type: m.type as string,
        file_name: m.file_name
      }));

    const index = mediaItems.findIndex(m => m.file_url === url);
    openLightbox(mediaItems, index >= 0 ? index : 0);
  }, [messages, openLightbox]);

  return (
      <div
        className={cn(
          "flex flex-col items-center relative overflow-hidden",
          type === "direct" ? "h-[calc(100dvh-55px)]" : "h-[calc(100dvh-40px)]"
        )}
      >
      <MediaLightbox />

      <MessageList
        messages={messages}
        messagesLoading={messagesLoading}
        status={status}
        loadMore={loadMore}
        typingUsers={typingUsers}
        user={user}
        color={color}
        textColor={textColor}
        onPreviewMedia={handlePreviewMedia}
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
