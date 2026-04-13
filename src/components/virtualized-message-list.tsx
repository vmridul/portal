"use client";

import { useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { MessageWithSender } from "@/lib/types";
import { formatToIST } from "@/lib/utils/date";
import { shouldShowMeta } from "@/lib/utils/message";
import { getSenderAvatar, getDisplayName } from "@/lib/utils/avatar";
import Image from "next/image";
import { VideoMessage } from "@/components/ui/videoMessage";

interface VirtualizedMessageListProps {
  messages: MessageWithSender[];
  currentUserId?: string;
  color: string;
  textColor: string;
  isMobile: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onMessageDelete: (messageId: string) => void;
  onDeleteDialogOpen: (open: boolean) => void;
}

export function VirtualizedMessageList({
  messages,
  currentUserId,
  color,
  textColor,
  isMobile,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onMessageDelete,
  onDeleteDialogOpen,
}: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  const handleScroll = useCallback(() => {
    if (parentRef.current && hasMore && !isLoadingMore) {
      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      if (scrollTop < 100) {
        onLoadMore();
      }
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  const renderMessage = useCallback(
    (index: number) => {
      const message = messages[index];
      if (!message) return null;

      const isImage = message.type?.startsWith("image/");
      const isVideo = message.type?.startsWith("video/");
      const isFile = message.file_url && !isImage && !isVideo;
      const isSystem = message.type === "system";
      const isCurrentUser = message.sender_id === currentUserId;

      if (isSystem) {
        return (
          <div
            key={message._id as string}
            className="px-3 py-1 mx-auto rounded-[6px] items-center text-white/70 text-xs flex justify-center my-2"
            style={{ height: 40 }}
          >
            <span className="font-medium">{message.sender?.username}</span>
            <span className="ml-2 whitespace-pre-wrap">{message.content}</span>
            <span className="ml-4">{formatToIST(message._creationTime)}</span>
          </div>
        );
      }

      const previousMsg = index > 0 ? messages[index - 1] : null;
      const showMeta = shouldShowMeta(message, previousMsg);

      return (
        <div
          key={message._id as string}
          className={`flex gap-2 ${showMeta ? "mt-2" : "my-0"} ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
          style={{ height: showMeta ? 80 : 60 }}
        >
          {showMeta ? (
            <Image
              src={getSenderAvatar(message.sender_id, currentUserId, message.sender, undefined)}
              width={40}
              height={40}
              unoptimized
              alt={message.sender?.username || "User"}
              className="w-8 h-8 rounded-[8px] flex-shrink-0 border border-theme-border"
            />
          ) : (
            <div className="w-8" />
          )}

          <div className={`flex flex-col max-w-[60%] ${isCurrentUser ? "items-end" : "items-start"}`}>
            {showMeta && (
              <div className={`flex items-center mb-1 gap-2 px-1 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                <span className={`text-xs truncate min-w-0 max-w-[140px] text-gray-400 ${isCurrentUser ? "text-right" : "text-left"}`}>
                  {getDisplayName(message.sender_id, currentUserId, message.sender)}
                </span>
                <span className="text-xs truncate min-w-0 max-w-[150px] text-gray-600">
                  {formatToIST(message._creationTime)}
                </span>
              </div>
            )}
            <div
              style={{
                borderRadius: isCurrentUser ? "8px 8px 0px 8px" : "8px 8px 8px 0px",
                backgroundColor: (isImage || isVideo || isFile) ? "transparent" : isCurrentUser ? color : `${color}3A`,
                color: (isImage || isVideo || isFile) ? undefined : isCurrentUser ? textColor : `${textColor}A`,
              }}
              className={`relative group px-2 py-1.5 ${!isVideo ? "md:hover:scale-100" : ""} transition-all duration-200 ease-in-out rounded-[6px] ${isImage || isVideo ? "bg-transparent" : isCurrentUser ? "" : " text-white/80"}`}
            >
              {isCurrentUser && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessageDelete(message._id as string);
                    onDeleteDialogOpen(true);
                  }}
                  className="absolute -top-3 -left-3 z-[60] w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              )}

              {isImage && message.file_url && (
                <Image src={message.file_url} alt="uploaded" width={200} height={200} className="max-w-[200px] max-h-[200px] rounded-[8px]" />
              )}
              {isVideo && message.file_url && <VideoMessage src={message.file_url} />}
              {isFile && message.file_url && (
                <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 border border-white/5">
                  {message.file_name}
                </a>
              )}
              {message.content && <div className="whitespace-pre-wrap">{message.content}</div>}
            </div>
          </div>
        </div>
      );
    },
    [messages, currentUserId, color, textColor, onMessageDelete, onDeleteDialogOpen]
  );

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className="flex-1 w-full px-4 md:px-10 overscroll-contain overflow-y-auto flex flex-col gap-1"
    >
      {isLoadingMore && (
        <div className="text-white/50 text-center py-2">Loading more...</div>
      )}
      <div style={{ height: virtualizer.getTotalSize() }}>
        {items.map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderMessage(virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}