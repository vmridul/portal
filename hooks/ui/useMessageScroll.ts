import { useEffect, useRef, useCallback, RefObject } from "react";
import type { MessageWithSender } from "@/lib/types";
import { VirtuosoHandle } from "react-virtuoso";

interface UseMessageScrollProps {
  virtuosoRef: RefObject<VirtuosoHandle | null>;
  messages: MessageWithSender[];
  typingCount: number;
}

export function useMessageScroll({
  virtuosoRef,
  messages,
  typingCount,
}: UseMessageScrollProps) {
  const prevTypingCount = useRef(0);

  const scrollToBottom = useCallback(
    (behavior: "smooth" | "auto" = "smooth") => {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1,
        behavior,
        align: "end",
      });
    },
    [virtuosoRef, messages.length],
  );

  // Handle manual scroll bottom request (Force Scroll)
  useEffect(() => {
    const handleScrollReq = () => scrollToBottom();
    window.addEventListener("force-scroll-bottom", handleScrollReq);
    return () =>
      window.removeEventListener("force-scroll-bottom", handleScrollReq);
  }, [scrollToBottom]);

  // Handle jump to message request
  useEffect(() => {
    const handleJump = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { id } = customEvent.detail;
      
      const index = messages.findIndex(m => m._id === id);
      if (index !== -1) {
        virtuosoRef.current?.scrollToIndex({
          index,
          behavior: "smooth",
          align: "center"
        });

        // The highlight logic now depends on the component rendering the item.
        // We'll dispatch a local event or rely on standard highlight logic being stable now.
        // For virtualization, we can't reliably query the DOM here since it might not be rendered yet.
        // The highlight will be handled by the MessageItem itself based on the same detail.id.
      }
    };
    window.addEventListener("jump-to-msg", handleJump);
    return () => window.removeEventListener("jump-to-msg", handleJump);
  }, [messages, virtuosoRef]);

  // Auto-scroll on typing start
  useEffect(() => {
    if (typingCount > 0 && prevTypingCount.current === 0) {
      scrollToBottom();
    }
    prevTypingCount.current = typingCount;
  }, [typingCount, scrollToBottom]);

  return { scrollToBottom };
}
