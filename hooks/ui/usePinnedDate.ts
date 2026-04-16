import { useState, useEffect, useRef, useCallback } from "react";
import { formatDateFull } from "@/lib/utils/date";
import type { MessageWithSender } from "@/lib/types";

interface UsePinnedDateProps {
  messages: MessageWithSender[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  pinnedHeaderRef: React.RefObject<HTMLDivElement | null>;
  headerHeight?: number;
}

export function usePinnedDate({
  messages,
  containerRef,
  viewportRef,
  pinnedHeaderRef,
  headerHeight = 44,
}: UsePinnedDateProps) {
  const [pinnedDate, setPinnedDate] = useState<string | null>(null);
  const lastActiveDateRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const scroller = containerRef.current;
      const viewport = viewportRef.current;
      const pinnedHeader = pinnedHeaderRef.current;
      if (!scroller || !viewport || !messages.length) return;

      const viewportTop = viewport.getBoundingClientRect().top;
      const items = scroller.querySelectorAll("[data-index]");
      
      // 1. Identify the active date section based on scroll position
      let activeIndex = -1;
      let activeItemRect: DOMRect | null = null;

      for (let i = 0; i < items.length; i++) {
        const item = items[i] as HTMLElement;
        const rect = item.getBoundingClientRect();
        
        // We consider an item "active" if its content has reached the sticky header line (5px)
        if (rect.bottom - viewportTop > 5) {
          activeIndex = parseInt(item.getAttribute("data-index") || "-1");
          activeItemRect = rect;
          break;
        }
      }

      // 2. Visibility Logic: Hide sticky header if at the extreme start
      let isVisible = true;
      let opacity = 1;

      if (activeIndex === 0 && activeItemRect) {
        const relativeTop = activeItemRect.top - viewportTop;

        // If the first message is still mostly visible at the top, we fade out the sticky header
        // This avoids having two identical date bubbles visible at once
        if (relativeTop > -20) {
           opacity = Math.max(0, Math.min(1, -relativeTop / 20)); // Smooth fade
           if (relativeTop >= 0) isVisible = false;
        }
      }

      if (isVisible && activeIndex !== -1 && messages[activeIndex]) {
        const newDate = formatDateFull(messages[activeIndex]._creationTime);
        if (newDate !== lastActiveDateRef.current) {
          lastActiveDateRef.current = newDate;
          setPinnedDate(newDate);
        }
      } else {
        if (lastActiveDateRef.current !== null) {
          setPinnedDate(null);
          lastActiveDateRef.current = null;
        }
      }

      // 3. Update DOM styles directly for zero-lag performance
      if (pinnedHeader) {
        // Calculate the push effect from upcoming headers
        const headers = scroller.querySelectorAll('[data-date-header="true"]');
        let newTranslateY = 0;

        for (let i = 0; i < headers.length; i++) {
          const header = headers[i] as HTMLElement;
          const rect = header.getBoundingClientRect();
          const relativeTop = rect.top - viewportTop;

          if (relativeTop > 0 && relativeTop < headerHeight) {
            newTranslateY = relativeTop - headerHeight;
            break;
          }
        }

        pinnedHeader.style.transform = `translateY(${newTranslateY}px)`;
        pinnedHeader.style.opacity = opacity.toString();
        // Skip updating display if not necessary, but ensure it's visible if needed
        pinnedHeader.style.visibility = isVisible ? "visible" : "hidden";
      }
    });
  }, [containerRef, viewportRef, pinnedHeaderRef, headerHeight, messages]);

  useEffect(() => {
    const scroller = containerRef.current;
    if (!scroller) return;

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, handleScroll]);

  return {
    pinnedDate,
  };
}
