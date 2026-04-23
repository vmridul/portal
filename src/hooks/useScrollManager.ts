"use client";

/**
 * useScrollManager — owns all DOM scroll concerns: scroll container ref,
 * position tracking, near-top / near-bottom detection, scroll anchoring
 * when messages are prepended, auto-scroll, and scroll-to-message.
 *
 * Does NOT own: message data, fetch decisions, or mode state.
 * Those concerns belong to useMessageWindow.
 *
 * Expects the caller (MessageList) to:
 *   - Attach `scrollContainerRef` to the scrollable div
 *   - Attach `bottomAnchorRef` to a sentinel div at the bottom
 *   - Call `saveScrollAnchor()` before any prepend operation
 *   - Call `restoreScrollAnchor()` in a useLayoutEffect after prepend re-renders
 */

import { useCallback, useRef, useState } from "react";

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  // px from bottom — within this range, user is considered "at bottom" and
  // new messages will auto-scroll. 100px feels instant but avoids false
  // triggers when the user is mid-scroll.
  NEAR_BOTTOM_THRESHOLD: 100,

  // px from top — when scrollTop drops below this, fire the onNearTop callback.
  // 300px gives enough runway to fetch before the user actually hits the top.
  NEAR_TOP_THRESHOLD: 300,

  // ms to wait after a scroll-to-message before re-enabling scroll checks.
  // Prevents the programmatic scroll from immediately triggering near-top/near-bottom fetch logic.
  SCROLL_SETTLE_DELAY_MS: 200,

  // ms to debounce near-top / near-bottom callbacks to prevent rapid-fire triggers
  SCROLL_CALLBACK_DEBOUNCE_MS: 150,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseScrollManagerOptions {
  /** Called when user scrolls near the top of the container */
  onNearTop?: () => void;
  /** Called when user scrolls near the bottom of the container (for catch-up) */
  onNearBottom?: () => void;
}

interface SavedScrollAnchor {
  /** The first visible message element's ID at the time of save */
  firstVisibleMessageId: string | null;
  /** The offset of that message's top edge from the viewport top */
  offsetFromTop: number;
  /** The container's scrollTop at save time */
  scrollTop: number;
  /** The container's scrollHeight at save time */
  scrollHeight: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useScrollManager(options: UseScrollManagerOptions = {}) {
  const { onNearTop, onNearBottom } = options;

  // ── Refs ────────────────────────────────────────────────────────────────
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const savedAnchorRef = useRef<SavedScrollAnchor | null>(null);

  // Suppresses scroll-triggered callbacks during programmatic scrolls (e.g.,
  // scrollToMessage) to prevent the scroll event from re-triggering fetch logic.
  const isScrollingProgrammaticallyRef = useRef(false);

  // Stores the latest callback refs so the scroll handler doesn't go stale
  const onNearTopRef = useRef(onNearTop);
  const onNearBottomRef = useRef(onNearBottom);
  onNearTopRef.current = onNearTop;
  onNearBottomRef.current = onNearBottom;

  // Debounce timers for near-top / near-bottom callbacks
  const nearTopDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const nearBottomDebounceTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  // Track whether we've already fired the callback so we don't fire again until scroll moves away and back
  const hasFiredNearTopRef = useRef(false);
  const hasFiredNearBottomRef = useRef(false);

  // ── Scroll state ────────────────────────────────────────────────────────
  const [isNearBottom, setIsNearBottom] = useState(true);
  const isNearBottomRef = useRef(true);

  // ── Scroll position helpers ─────────────────────────────────────────────

  function calculateIsNearBottom(container: HTMLElement): boolean {
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom < CONFIG.NEAR_BOTTOM_THRESHOLD;
  }

  function calculateIsNearTop(container: HTMLElement): boolean {
    return container.scrollTop < CONFIG.NEAR_TOP_THRESHOLD;
  }

  /**
   * Finds the first message element that is visible in the viewport.
   * Returns the message ID and its offset from the top of the viewport.
   */
  function findFirstVisibleMessage(container: HTMLElement): {
    messageId: string | null;
    offsetFromTop: number;
  } {
    const messageElements = container.querySelectorAll("[data-message-id]");
    const containerRect = container.getBoundingClientRect();

    for (const el of messageElements) {
      const rect = el.getBoundingClientRect();
      // Element is visible if its bottom edge is below the container's top edge
      if (rect.bottom > containerRect.top + 1) {
        return {
          messageId: el.getAttribute("data-message-id"),
          offsetFromTop: rect.top - containerRect.top,
        };
      }
    }

    return { messageId: null, offsetFromTop: 0 };
  }

  // ── Scroll event handler ────────────────────────────────────────────────

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Don't trigger callbacks during programmatic scrolls (scrollToMessage, etc.)
    if (isScrollingProgrammaticallyRef.current) return;

    const nearBottom = calculateIsNearBottom(container);
    const nearTop = calculateIsNearTop(container);

    // Only update React state when the value actually changes to avoid re-renders
    if (nearBottom !== isNearBottomRef.current) {
      isNearBottomRef.current = nearBottom;
      setIsNearBottom(nearBottom);
    }

    // Reset "has fired" flags when user scrolls away from the edge
    if (!nearTop && hasFiredNearTopRef.current) {
      hasFiredNearTopRef.current = false;
    }
    if (!nearBottom && hasFiredNearBottomRef.current) {
      hasFiredNearBottomRef.current = false;
    }

    // Debounced near-top callback
    if (nearTop && !hasFiredNearTopRef.current) {
      if (nearTopDebounceTimerRef.current) {
        clearTimeout(nearTopDebounceTimerRef.current);
      }
      nearTopDebounceTimerRef.current = setTimeout(() => {
        // Double-check we're still near top after debounce
        if (
          scrollContainerRef.current &&
          calculateIsNearTop(scrollContainerRef.current)
        ) {
          hasFiredNearTopRef.current = true;
          onNearTopRef.current?.();
        }
      }, CONFIG.SCROLL_CALLBACK_DEBOUNCE_MS);
    }

    // Debounced near-bottom callback
    if (nearBottom && !hasFiredNearBottomRef.current) {
      if (nearBottomDebounceTimerRef.current) {
        clearTimeout(nearBottomDebounceTimerRef.current);
      }
      nearBottomDebounceTimerRef.current = setTimeout(() => {
        if (
          scrollContainerRef.current &&
          calculateIsNearBottom(scrollContainerRef.current)
        ) {
          hasFiredNearBottomRef.current = true;
          onNearBottomRef.current?.();
        }
      }, CONFIG.SCROLL_CALLBACK_DEBOUNCE_MS);
    }
  }, []);

  // NOTE: No useEffect for addEventListener here. The caller attaches
  // handleScroll via React's onScroll prop, which guarantees the handler
  // is bound whenever the element exists in the DOM. The previous
  // useEffect approach failed because it ran once during ChatSkeleton
  // (when scrollContainerRef was null) and never re-ran.

  // ── Scroll actions ──────────────────────────────────────────────────────

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomAnchorRef.current?.scrollIntoView({ behavior });
  }, []);

  /**
   * Scrolls a specific message into view and optionally centers it vertically.
   * Temporarily suppresses scroll callbacks to prevent the programmatic scroll
   * from triggering near-top/near-bottom fetch logic.
   */
  const scrollToMessage = useCallback((messageId: string) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const messageElement = container.querySelector(
      `[data-message-id="${messageId}"]`,
    ) as HTMLElement | null;
    if (!messageElement) return;

    isScrollingProgrammaticallyRef.current = true;

    messageElement.scrollIntoView({
      behavior: "instant",
      block: "center",
    });

    // Re-enable scroll checks after the scroll settles
    setTimeout(() => {
      isScrollingProgrammaticallyRef.current = false;
    }, CONFIG.SCROLL_SETTLE_DELAY_MS);
  }, []);

  // ── Scroll anchoring for prepend operations ─────────────────────────────
  //
  // When older messages are prepended, the scroll position would normally jump
  // because new content is added above the viewport. We compensate by recording
  // the first visible message element and its offset from the viewport top.
  // After React re-renders, we find that same message and scroll it to the same
  // offset. This is immune to async image loading because it anchors to a
  // specific element, not to scrollHeight math.
  //
  // This two-step dance (save → restore) must be coordinated by the caller:
  //   1. Call saveScrollAnchor() before triggering the fetch
  //   2. Call restoreScrollAnchor() in a useLayoutEffect watching the messages array

  const saveScrollAnchor = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { messageId, offsetFromTop } = findFirstVisibleMessage(container);

    savedAnchorRef.current = {
      firstVisibleMessageId: messageId,
      offsetFromTop,
      scrollTop: container.scrollTop,
      scrollHeight: container.scrollHeight,
    };
  }, []);

  const restoreScrollAnchor = useCallback(() => {
    const container = scrollContainerRef.current;
    const savedAnchor = savedAnchorRef.current;
    if (!container || !savedAnchor) return;

    // Disable smooth scrolling and native scroll anchoring during restore
    // so the adjustment is instant and invisible to the user
    const originalScrollBehavior = container.style.scrollBehavior;
    const originalOverflowAnchor = (container.style as any).overflowAnchor;
    container.style.scrollBehavior = "auto";
    (container.style as any).overflowAnchor = "none";

    // Force a synchronous layout read to ensure we have fresh measurements
    // before modifying scrollTop (prevents the browser from painting intermediate state)
    void container.scrollHeight;

    // Strategy 1: Element-based anchoring (preferred — immune to async content)
    if (savedAnchor.firstVisibleMessageId) {
      const messageElement = container.querySelector(
        `[data-message-id="${savedAnchor.firstVisibleMessageId}"]`,
      ) as HTMLElement | null;

      if (messageElement) {
        const containerRect = container.getBoundingClientRect();
        const messageRect = messageElement.getBoundingClientRect();
        const currentOffset = messageRect.top - containerRect.top;
        const adjustment = currentOffset - savedAnchor.offsetFromTop;

        // Only adjust if the offset has actually changed (prevents unnecessary scrolls)
        if (Math.abs(adjustment) > 1) {
          container.scrollTop += adjustment;
        }

        savedAnchorRef.current = null;

        // Restore styles in the next frame to avoid affecting other scroll operations
        requestAnimationFrame(() => {
          container.style.scrollBehavior = originalScrollBehavior;
          (container.style as any).overflowAnchor = originalOverflowAnchor;
        });
        return;
      }
    }

    // Strategy 2: Fallback to scrollHeight-based anchoring
    // (used when the anchored message was removed by window capping)
    const heightDifference = container.scrollHeight - savedAnchor.scrollHeight;
    if (heightDifference > 0) {
      container.scrollTop = savedAnchor.scrollTop + heightDifference;
    }

    savedAnchorRef.current = null;

    requestAnimationFrame(() => {
      container.style.scrollBehavior = originalScrollBehavior;
      (container.style as any).overflowAnchor = originalOverflowAnchor;
    });
  }, []);

  /**
   * Re-restores the scroll anchor after async content (like images) loads.
   * This should be called when images finish loading to correct any drift.
   */
  const reRestoreScrollAnchor = useCallback(() => {
    const container = scrollContainerRef.current;
    const savedAnchor = savedAnchorRef.current;
    if (!container || !savedAnchor) return;

    // Only re-restore if we still have a pending anchor (restore hasn't succeeded yet)
    // and if the element-based anchor is still applicable
    if (savedAnchor.firstVisibleMessageId) {
      const messageElement = container.querySelector(
        `[data-message-id="${savedAnchor.firstVisibleMessageId}"]`,
      ) as HTMLElement | null;

      if (messageElement) {
        const containerRect = container.getBoundingClientRect();
        const messageRect = messageElement.getBoundingClientRect();
        const currentOffset = messageRect.top - containerRect.top;
        const adjustment = currentOffset - savedAnchor.offsetFromTop;

        if (Math.abs(adjustment) > 1) {
          container.scrollTop += adjustment;
        }
      }
    }
  }, []);

  // ── Public API ──────────────────────────────────────────────────────────

  return {
    // refs — attach these to the DOM
    scrollContainerRef,
    bottomAnchorRef,

    // scroll state
    isNearBottom,
    isNearBottomRef,

    // actions
    scrollToBottom,
    scrollToMessage,
    saveScrollAnchor,
    restoreScrollAnchor,
    reRestoreScrollAnchor,
    handleScroll,
  };
}
