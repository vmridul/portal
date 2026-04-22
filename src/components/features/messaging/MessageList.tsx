import React, { useRef, useState, useCallback, useEffect } from "react";
import { MessageItem } from "./MessageItem";
import { usePinnedDate } from "@/hooks/ui/usePinnedDate";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import type { User, MessageWithSender } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ChatSkeleton } from "@/components/shared/skeletons/ChatSkeleton";

interface MessageListProps {
  messages: MessageWithSender[];
  messagesLoading: boolean;
  status: "Loaded" | "Loading";
  typingUsers: { username: string }[];
  user: User | null;
  color: string;
  textColor: string;
  onPreviewMedia: (url: string) => void;
  onDeleteRequest: (id: string) => void;
  shouldScrollToBottom: boolean;
  setShouldScrollToBottom: (val: boolean) => void;
}

export const MessageList = React.memo(
  ({
    messages,
    messagesLoading,
    status,
    typingUsers,
    user,
    color,
    textColor,
    onPreviewMedia,
    onDeleteRequest,
    shouldScrollToBottom,
    setShouldScrollToBottom,
  }: MessageListProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const pinnedHeaderRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const isAtBottomRef = useRef(true);
    const prevMessagesLength = useRef(messages.length);

    // Re-enable pinned date headers
    usePinnedDate({
      messages,
      containerRef: scrollRef,
      viewportRef,
      pinnedHeaderRef,
      headerHeight: 40,
    });

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
      bottomRef.current?.scrollIntoView({ behavior });
    }, []);

    const handleScroll = useCallback(() => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      isAtBottomRef.current = isAtBottom;
      setShowScrollDown(!isAtBottom);
    }, []);

    useEffect(() => {
      if (shouldScrollToBottom) {
        scrollToBottom();
        setShouldScrollToBottom(false);
      }
    }, [shouldScrollToBottom, scrollToBottom, setShouldScrollToBottom]);

    useEffect(() => {
      const isNewMessageAppend = messages.length > prevMessagesLength.current;
      if (isNewMessageAppend) {
        const lastMsg = messages[messages.length - 1];
        const sentByMe = lastMsg.sender_id === user?.user_id;

        if (sentByMe || isAtBottomRef.current) {
          scrollToBottom();
        }
      }
      prevMessagesLength.current = messages.length;
    }, [messages, user?.user_id, scrollToBottom]);

    if (messagesLoading && messages.length === 0) {
      return <ChatSkeleton />;
    }

    return (
      <div ref={viewportRef} className="flex-1 w-full relative h-full flex flex-col overflow-hidden">
        {showScrollDown && messages.length > 0 && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-5 z-[2000] left-[50%] translate-x-[-50%] rounded-[10px] p-1 text-gray-400 cursor-pointer border border-theme-border bg-theme-base transition-all duration-200 ease-out hover:bg-theme-hover active:scale-95"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} className={cn("h-6 w-6")} />
          </button>
        )}

        {/* Pinned Date Header Overlay */}
        <div
          ref={pinnedHeaderRef}
          className="absolute top-[5px] left-0 right-0 z-20 flex items-center justify-center pointer-events-none"
          style={{ visibility: "hidden" }}
        >
          <span
            className={cn(
              "px-4 py-1 rounded-full bg-theme-border/80 backdrop-blur-md border border-theme-border text-xs text-gray-300 shadow-lg",
            )}
          ></span>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 w-full overflow-y-auto scroll-smooth px-4"
        >
          <div className="flex flex-col min-h-full">
            <div className="flex-1" />
            
            <div className="flex flex-col py-4">
              {messages.map((message, index) => {
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

                return (
                  <div key={message._id} data-index={index}>
                    <MessageItem
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
              })}
            </div>

            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 pt-2 pb-6 pl-4 md:pl-10">
                <div className="w-10 h-10 rounded-[12px] border border-[#2a2a2a] flex items-center justify-center bg-theme-surface">
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
            
            <div ref={bottomRef} className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  },
);

MessageList.displayName = "MessageList";
