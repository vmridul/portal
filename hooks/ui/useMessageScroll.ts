import { useEffect, useRef, useCallback, RefObject } from "react";
import type { MessageWithSender } from "@/lib/types";

interface UseMessageScrollProps {
  containerRef: RefObject<HTMLDivElement | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
  messages: MessageWithSender[];
  typingCount: number;
  shouldScrollToBottom: boolean;
  setShouldScrollToBottom: (val: boolean) => void;
  isMobile: boolean;
}

export function useMessageScroll({
  containerRef,
  bottomRef,
  messages,
  typingCount,
  shouldScrollToBottom,
  setShouldScrollToBottom,
  isMobile,
}: UseMessageScrollProps) {
  const prevTypingCount = useRef(0);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      setShouldScrollToBottom(true);
      if (isMobile && containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
        return;
      }

      if (behavior === "smooth") {
        // Standard smooth scroll with fallback
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "auto",
        });
      }
    },
    [setShouldScrollToBottom, isMobile, containerRef, bottomRef],
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
      const el = document.querySelector(`[data-msg-id="${id}"]`) as HTMLElement;
      if (el) {
        setShouldScrollToBottom(false);
        el.scrollIntoView({ behavior: "smooth", block: "center" });

        // Highlight the entire message row using direct style manipulation
        const originalBg = el.style.backgroundColor;
        const originalTransition = el.style.transition;

        el.style.transition = "background-color 0.3s ease-out";
        el.style.backgroundColor = "rgba(180, 140, 0, 0.2)";

        setTimeout(() => {
          el.style.transition = "background-color 1.0s ease-in-out";
          el.style.backgroundColor = originalBg;

          setTimeout(() => {
            el.style.transition = originalTransition;
          }, 1500);
        }, 2000);
      }
    };
    window.addEventListener("jump-to-msg", handleJump);
    return () => window.removeEventListener("jump-to-msg", handleJump);
  }, [setShouldScrollToBottom]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!shouldScrollToBottom) return;

    // Immediate scroll
    if (isMobile && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }

    // Smooth scroll delay to ensure layout is settled
    const timer = setTimeout(() => {
      if (!isMobile) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, shouldScrollToBottom, isMobile, containerRef, bottomRef]);

  // Auto-scroll on typing start
  useEffect(() => {
    if (typingCount > 0 && prevTypingCount.current === 0) {
      scrollToBottom();
    }
    prevTypingCount.current = typingCount;
  }, [typingCount, scrollToBottom]);

  return { scrollToBottom };
}
