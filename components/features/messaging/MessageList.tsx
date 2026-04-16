import React, { useRef, useState, useCallback } from "react";
import { MessageItem } from "./MessageItem";
import { useMessageScroll } from "@/hooks/ui/useMessageScroll";
import { usePinnedDate } from "@/hooks/ui/usePinnedDate";
import { ArrowDown } from "lucide-react";
import type { User, MessageWithSender } from "@/lib/types";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

import { ChatSkeleton } from "@/components/shared/skeletons/ChatSkeleton";

interface MessageListProps {
  messages: MessageWithSender[];
  messagesLoading: boolean;
  typingUsers: { username: string }[];
  user: User | null;
  color: string;
  textColor: string;
  onPreviewMedia: (url: string) => void;
  onDeleteRequest: (id: string) => void;
  shouldScrollToBottom: boolean;
  setShouldScrollToBottom: (val: boolean) => void;
  inputBarHeightOffset?: number;
}

export const MessageList = React.memo(({
  messages,
  messagesLoading,
  typingUsers,
  user,
  color,
  textColor,
  onPreviewMedia,
  onDeleteRequest,
  shouldScrollToBottom,
  setShouldScrollToBottom,
  inputBarHeightOffset = 100
}: MessageListProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pinnedHeaderRef = useRef<HTMLDivElement>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const { pinnedDate } = usePinnedDate({
    messages,
    containerRef: scrollerRef,
    viewportRef,
    pinnedHeaderRef,
    headerHeight: 40,
  });

  const { scrollToBottom } = useMessageScroll({
    virtuosoRef,
    messages,
    typingCount: typingUsers.length,
  });

  const handleScroll = useCallback((atBottom: boolean) => {
    setShowScrollDown(!atBottom);
  }, []);

  return (
    <>
      {showScrollDown && messages.length > 0 && !messagesLoading && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className={`absolute z-[2000] left-[50%] translate-x-[-50%] rounded-[10px] p-1 text-gray-300 border border-theme-border border-opacity-90 bg-theme-hover bg-opacity-80 backdrop-blur-md transition-all duration-200 ease-out`}
          style={{ bottom: `${inputBarHeightOffset}px` }}
        >
          <ArrowDown className="h-6 w-6" />
        </button>
      )}

      {pinnedDate && (
        <div
          ref={pinnedHeaderRef}
          className="absolute top-[5px] left-0 right-0 z-20 flex items-center justify-center pointer-events-none"
        >
          <span className="px-3 py-1 rounded-full bg-theme-base bg-opacity-80 backdrop-blur text-xs text-gray-400 border border-theme-border shadow-sm">
            {pinnedDate}
          </span>
        </div>
      )}

      <div ref={viewportRef} className="flex-1 w-full relative h-full">
        {messagesLoading ? null : (
          <Virtuoso<MessageWithSender>
            ref={virtuosoRef}
            scrollerRef={(el) => {
              if (el instanceof HTMLDivElement) {
                (scrollerRef as any).current = el;
              }
            }}
            data={messages}
            alignToBottom={true}
            followOutput={(isAtBottom: boolean) => (isAtBottom ? "auto" : false)}
            atBottomStateChange={handleScroll}
            increaseViewportBy={800}
            className="flex-1 w-full h-full"
            style={{
              backgroundColor: "transparent",
            }}
            components={{
              Header: () => <div className="h-0" />,
              Footer: () => (
                <div className="flex flex-col gap-2 p-6">
                  {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-8 rounded-[8px] border border-[#2a2a2a] flex items-center justify-center bg-theme-surface">
                        <span className="flex gap-1">
                          <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce"></span>
                        </span>
                      </div>
                      <span className="text-xs text-white/50 italic">
                        {typingUsers
                          .filter(Boolean)
                          .map((u) => u?.username)
                          .filter(Boolean)
                          .join(", ")}{" "}
                        {typingUsers.length === 1 ? "is" : "are"} typing...
                      </span>
                    </div>
                  )}
                  <div className="h-20" /> {/* Bottom padding */}
                </div>
              ),
            }}
            itemContent={(index, message) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              return (
                <div data-index={index} className="py-0">
                  <MessageItem
                    key={message._id}
                    message={message}
                    prevMessage={prevMessage}
                    user={user}
                    isCurrentUser={message.sender_id === user?.user_id}
                    color={color}
                    textColor={textColor}
                    onPreviewMedia={onPreviewMedia}
                    onDeleteRequest={onDeleteRequest}
                  />
                </div>
              );
            }}
          />
        )}
      </div>
    </>
  );
});

MessageList.displayName = "MessageList";
