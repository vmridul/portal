import React, { useRef, useState, useCallback, useEffect } from "react";
import { MessageItem } from "./MessageItem";
import { usePinnedDate } from "@/hooks/ui/usePinnedDate";
import { ArrowDown } from "lucide-react";
import type { User, MessageWithSender } from "@/lib/types";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

import { ChatSkeleton } from "@/components/shared/skeletons/ChatSkeleton";

interface MessageListProps {
  messages: MessageWithSender[];
  messagesLoading: boolean;
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadMore: () => void;
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

const START_INDEX = 10000;

export const MessageList = React.memo(({
  messages,
  messagesLoading,
  status,
  loadMore,
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
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pinnedHeaderRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const isAtBottomRef = useRef(true);
  const prevMessagesLengthRefForScroll = useRef(messages.length);
  const prevFirstMsgIdRefForScroll = useRef<string | null>(messages[0]?._id || null);

  // We use a stable firstItemIndex for Virtuoso. Index corrections must happen synchronously 
  // during the render phase to avoid the "double-render" jank/flicker.
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);
  const [prevFirstMsgId, setPrevFirstMsgId] = useState<string | null>(null);
  const [prevLength, setPrevLength] = useState(0);

  if (messages.length > 0 && (messages[0]._id !== prevFirstMsgId || messages.length !== prevLength)) {
    const isPrepend = prevFirstMsgId !== null && messages[0]._id !== prevFirstMsgId;
    if (isPrepend) {
      const diff = messages.length - prevLength;
      setFirstItemIndex((prev) => prev - diff);
    } else if (prevFirstMsgId === null) {
      // Initial load: calibrate the starting index
      setFirstItemIndex(START_INDEX - messages.length);
    }
    setPrevFirstMsgId(messages[0]._id);
    setPrevLength(messages.length);
  }

  const initialIndex = React.useMemo(() => {
    return messages.length > 0 ? messages.length - 1 : 0;
  }, [messagesLoading]);

  const computeItemKey = useCallback((index: number, message: MessageWithSender) => {
    return message?._id || index;
  }, []);

  usePinnedDate({
    messages,
    containerRef: scrollerRef,
    viewportRef,
    pinnedHeaderRef,
    headerHeight: 40,
  });

  const handleScroll = useCallback((atBottom: boolean) => {
    isAtBottomRef.current = atBottom;
    setShowScrollDown(!atBottom);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore();
    }
  }, [status, loadMore]);

  // Handle automatic and explicit scroll requests
  useEffect(() => {
    const currentFirstMsgId = messages[0]?._id || null;
    const isAppend = messages.length > prevMessagesLengthRefForScroll.current &&
      currentFirstMsgId === prevFirstMsgIdRefForScroll.current;

    if (isAppend) {
      const lastMsg = messages[messages.length - 1];
      const sentByMe = lastMsg.sender_id === user?.user_id;

      // Rule: Always scroll if I sent it OR if I was already at the bottom.
      // shouldScrollToBottom is the explicit trigger from ChatInputBar.
      if (sentByMe || isAtBottomRef.current || shouldScrollToBottom) {
        virtuosoRef.current?.scrollToIndex({
          index: messages.length - 1 + firstItemIndex,
          behavior: "smooth",
        });
      }
    }

    // Always handle shouldScrollToBottom if it's explicitly set true
    if (shouldScrollToBottom && !isAppend) {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1 + firstItemIndex,
        behavior: "smooth",
      });
      setShouldScrollToBottom(false);
    } else if (shouldScrollToBottom && isAppend) {
      setShouldScrollToBottom(false);
    }

    prevMessagesLengthRefForScroll.current = messages.length;
    prevFirstMsgIdRefForScroll.current = currentFirstMsgId;
  }, [messages, user?.user_id, firstItemIndex, shouldScrollToBottom, setShouldScrollToBottom]);

  if (messagesLoading && messages.length === 0) {
    return <ChatSkeleton />;
  }

  return (
    <>
      {showScrollDown && messages.length > 0 && (
        <button
          onClick={() => {
            virtuosoRef.current?.scrollToIndex({
              index: messages.length - 1 + firstItemIndex,
              behavior: "smooth",
            });
          }}
          className={`absolute z-[2000] left-[50%] translate-x-[-50%] rounded-[10px] p-1 text-gray-300 border border-theme-border border-opacity-90 bg-theme-hover bg-opacity-90 transition-all duration-200 ease-out`}
          style={{ bottom: `${inputBarHeightOffset}px` }}
        >
          <ArrowDown className="h-6 w-6" />
        </button>
      )}

      <div
        ref={pinnedHeaderRef}
        className="absolute top-[5px] left-0 right-0 z-20 flex items-center justify-center pointer-events-none"
        style={{ visibility: "hidden" }}
      >
        <span className="px-3 py-1 rounded-full bg-theme-base bg-opacity-95 text-xs text-gray-400 border border-theme-border shadow-sm">
          {/* Content managed by usePinnedDate for performance */}
        </span>
      </div>

      <div ref={viewportRef} className="flex-1 w-full relative h-full">
        <Virtuoso<MessageWithSender>
          ref={virtuosoRef}
          data={messages}
          firstItemIndex={firstItemIndex}
          initialTopMostItemIndex={initialIndex}
          computeItemKey={computeItemKey}
          alignToBottom={true}
          increaseViewportBy={1200}
          atBottomThreshold={300}
          atBottomStateChange={handleScroll}
          startReached={handleLoadMore}
          followOutput={false}
          className="flex-1 w-full h-full"
          style={{ backgroundColor: "transparent" }}
          scrollerRef={(el) => {
            if (el instanceof HTMLDivElement) {
              (scrollerRef as any).current = el;
            }
          }}
          components={{
            Header: () => (
              <div className="flex items-center justify-center p-4">
                {status === "LoadingMore" && (
                  <div className="w-5 h-5 border-2 border-theme-border border-t-white rounded-full animate-spin" />
                )}
              </div>
            ),
            Footer: () => (
              <div className="flex flex-col gap-2 p-6">
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 pt-2">
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
                <div className="h-16" />
              </div>
            ),
          }}
          itemContent={(index, message) => {
            const dataIndex = index - firstItemIndex;
            const prevMessage = dataIndex > 0 ? messages[dataIndex - 1] : null;
            const nextMessage = dataIndex < messages.length - 1 ? messages[dataIndex + 1] : null;

            return (
              <div data-index={index} className="py-0">
                <MessageItem
                  key={message._id}
                  message={message}
                  prevMessage={prevMessage}
                  nextMessage={nextMessage}
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
      </div>
    </>
  );
});

MessageList.displayName = "MessageList";
