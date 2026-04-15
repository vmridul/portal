import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { MessageItem } from "./MessageItem";
import { useInView } from "react-intersection-observer";
import { useMessageScroll } from "@/hooks/ui/useMessageScroll";
import { ArrowDown } from "lucide-react";
import { formatDateFull } from "@/lib/utils/date";
import type { User, MessageWithSender } from "@/lib/types";

interface MessageListProps {
  messages: MessageWithSender[];
  messagesLoading: boolean;
  typingUsers: { username: string }[];
  user: User | null;
  color: string;
  textColor: string;
  onPreviewImage: (url: string) => void;
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
  onPreviewImage,
  onDeleteRequest,
  shouldScrollToBottom,
  setShouldScrollToBottom,
  inputBarHeightOffset = 100
}: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [currentDate, setCurrentDate] = useState<string | null>(
    messages.length > 0 ? formatDateFull(messages[0]._creationTime) : null
  );

  const prevTypingUsersLength = useRef(0);

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  const { scrollToBottom } = useMessageScroll({
    containerRef,
    bottomRef,
    messages,
    typingCount: typingUsers.length,
    shouldScrollToBottom,
    setShouldScrollToBottom,
    isMobile
  });

  // Intersection observer for tracking which date is currently at the top of the viewport
  // We can track the intersections of date boundaries or messages.
  // Instead of synchronous onScroll layout thrashing, we map dates via observer on the container.
  // Given we map over all messages, a simpler approach is a debounced scroll listener if observer is too complex to attach to hundreds of items.
  // Let's stick to a throttled/optimized scroll listener or intersection observer. We'll use intersection observer on the message items.

  // Update current date based on visibility
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const date = entry.target.getAttribute("data-date");
            if (date) setCurrentDate(date);
          }
        });
      },
      {
        root: el,
        rootMargin: "-10% 0px -85% 0px", // Focus on the top area of the scroll container
        threshold: 0,
      }
    );

    const onScroll = () => {
      const isScrolledUp = el.scrollTop + el.clientHeight < el.scrollHeight - 80;
      setShowScrollDown(isScrolledUp);
    };

    el.addEventListener("scroll", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      observerRef.current?.disconnect();
    };
  }, []);

  const onSetRef = useCallback((el: HTMLDivElement | null, date: string) => {
    if (el) {
      el.setAttribute("data-date", date);
      observerRef.current?.observe(el);
    }
  }, []);



  return (
    <>
      {showScrollDown && (
        <button
          onClick={() => scrollToBottom()}
          className={`absolute z-[2000] left-[50%] translate-x-[-50%] rounded-[10px] p-1 text-gray-300 border border-theme-border border-opacity-90 bg-theme-hover bg-opacity-80 backdrop-blur-md transition-all duration-200 ease-out md:bottom-[100px] bottom-[80px]`}
          style={{ bottom: `${inputBarHeightOffset}px` }}
        >
          <ArrowDown className="h-6 w-6" />
        </button>
      )}

      <div
        ref={containerRef}
        className="flex-1 w-full px-4 md:px-10 overscroll-contain overflow-y-auto flex flex-col gap-2"
        style={{ paddingBottom: "100px" }}
      >
        {currentDate && (
          <div className="sticky top-0 z-10 flex items-center justify-center py-2 -mx-4 md:-mx-10 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-theme-base bg-opacity-80 backdrop-blur text-xs text-gray-400 border border-theme-border shadow-sm">
              {currentDate}
            </span>
          </div>
        )}
        {messagesLoading ? (
          <div className="text-white/50 text-center py-4">
            Loading messages...
          </div>
        ) : (
          messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            return (
              <MessageItem
                key={message._id}
                message={message}
                prevMessage={prevMessage}
                user={user}
                isCurrentUser={message.sender_id === user?.user_id}
                color={color}
                textColor={textColor}
                pinnedDate={currentDate}
                onSetRef={(el) => onSetRef(el, formatDateFull(message._creationTime))}
                onPreviewImage={onPreviewImage}
                onDeleteRequest={onDeleteRequest}
              />
            );
          })
        )}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 mt-6">
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
        <div ref={bottomRef} />
      </div>
    </>
  );
});

MessageList.displayName = "MessageList";
