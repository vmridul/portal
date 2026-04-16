import { useEffect, useCallback, RefObject } from "react";
import type { MessageWithSender } from "@/lib/types";
import { VirtuosoHandle } from "react-virtuoso";

interface UseMessageScrollProps {
  virtuosoRef: RefObject<VirtuosoHandle | null>;
  scrollerRef: RefObject<HTMLDivElement | null>;
  messages: MessageWithSender[];
}

export function useMessageScroll({
  virtuosoRef,
  scrollerRef,
  messages,
}: UseMessageScrollProps) {
  const scrollToBottom = useCallback(
    (behavior: "smooth" | "auto" = "smooth") => {
      if (messages.length === 0) return;
      
      if (scrollerRef.current) {
        scrollerRef.current.scrollTo({
          top: scrollerRef.current.scrollHeight,
          behavior,
        });
      } else {
        // Fallback to index if scrollerRef not available
        virtuosoRef.current?.scrollToIndex({
          index: messages.length - 1,
          behavior,
          align: "end",
        });
      }
    },
    [virtuosoRef, scrollerRef, messages.length],
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
      }
    };
    window.addEventListener("jump-to-msg", handleJump);
    return () => window.removeEventListener("jump-to-msg", handleJump);
  }, [messages, virtuosoRef]);

  return { scrollToBottom };
}
