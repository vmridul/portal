import React, { useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { MessageItem } from "./MessageItem";
import { usePinnedDate } from "@/hooks/ui/usePinnedDate";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import type { User, MessageWithSender } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

import { ChatSkeleton } from "@/components/shared/skeletons/ChatSkeleton";
import { useMessageWindow } from "@/hooks/useMessageWindow";
import { useScrollManager } from "@/hooks/useScrollManager";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MessageListProps {
  conversationId: string;
  conversationType: "room" | "direct";
  initialMessageId?: string;
  typingUsers: { username: string }[];
  user: User | null;
  color: string;
  textColor: string;
  onDeleteRequest: (id: string) => void;
  /** Numeric trigger — incremented by parent to force return-to-live + scroll-to-bottom */
  returnToLiveTrigger: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MessageList = React.memo(
  ({
    conversationId,
    conversationType,
    initialMessageId,
    typingUsers,
    user,
    color,
    textColor,
    onDeleteRequest,
    returnToLiveTrigger,
  }: MessageListProps) => {
    // ── Message window (data + state machine) ─────────────────────────────
    const messageWindow = useMessageWindow(conversationId, initialMessageId);

    // ── Scroll manager (DOM scroll concerns) ──────────────────────────────
    const scrollManager = useScrollManager({
      onNearTop: () => {
        if (messageWindow.canLoadOlder && !messageWindow.isLoadingOlder) {
          // Save the scroll anchor BEFORE we fetch — the restoreScrollAnchor call
          // in useLayoutEffect below will compensate after the new messages render
          scrollManager.saveScrollAnchor();
          messageWindow.loadOlderMessages();
        }
      },
      onNearBottom: () => {
        if (
          messageWindow.mode === "HISTORY" &&
          messageWindow.canLoadNewer &&
          !messageWindow.isLoadingNewer
        ) {
          messageWindow.loadNewerMessages();
        }
      },
    });

    // ── Pinned date header support ────────────────────────────────────────
    const viewportRef = useRef<HTMLDivElement>(null);
    const pinnedHeaderRef = useRef<HTMLDivElement>(null);

    usePinnedDate({
      messages: messageWindow.messages,
      containerRef: scrollManager.scrollContainerRef,
      viewportRef,
      pinnedHeaderRef,
      headerHeight: 40,
    });

    // ── Scroll anchoring after older messages are prepended ───────────────
    // This useLayoutEffect fires synchronously after React updates the DOM
    // but before the browser paints, preventing any visible scroll jump.
    const previousMessageCountRef = useRef(messageWindow.messages.length);
    const previousOldestIdRef = useRef<string | null>(
      messageWindow.messages[0]?._id ?? null,
    );
    const previousOldestTimeRef = useRef<number>(
      messageWindow.messages[0]?._creationTime ?? Infinity,
    );

    useLayoutEffect(() => {
      const currentOldestMessage = messageWindow.messages[0];
      const currentOldestId = currentOldestMessage?._id ?? null;
      const currentOldestTime = currentOldestMessage?._creationTime ?? Infinity;
      const currentLength = messageWindow.messages.length;

      // Detect prepending by checking if the oldest message got older (smaller creationTime)
      // AND the oldest message ID changed. This is robust against window capping where
      // the array length stays constant at MAX_WINDOW_SIZE.
      const oldestGotOlder = currentOldestTime < previousOldestTimeRef.current;
      const oldestIdChanged = currentOldestId !== previousOldestIdRef.current;
      const wasPrepeneded = oldestGotOlder && oldestIdChanged;

      if (wasPrepeneded) {
        scrollManager.restoreScrollAnchor();
      }

      previousMessageCountRef.current = currentLength;
      previousOldestIdRef.current = currentOldestId;
      previousOldestTimeRef.current = currentOldestTime;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageWindow.messages]);

    // ── Auto-scroll on new messages in LIVE mode ──────────────────────────
    // Only scrolls when a genuinely NEW message arrives (tracked by ID),
    // not on every re-render. This prevents the scroll-to-bottom from
    // fighting the user's manual upward scroll.
    const lastRenderedMessageIdRef = useRef<string | null>(null);

    useEffect(() => {
      if (messageWindow.mode !== "LIVE") return;
      if (messageWindow.messages.length === 0) return;

      const lastMessage =
        messageWindow.messages[messageWindow.messages.length - 1];
      const lastMessageId = lastMessage._id;

      // Skip if this is the same message we already handled
      if (lastMessageId === lastRenderedMessageIdRef.current) return;
      lastRenderedMessageIdRef.current = lastMessageId;

      const sentByCurrentUser = lastMessage.sender_id === user?.user_id;

      // Auto-scroll if the user sent the message OR is already near bottom
      if (sentByCurrentUser || scrollManager.isNearBottomRef.current) {
        scrollManager.scrollToBottom();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageWindow.messages, messageWindow.mode, user?.user_id]);

    // ── Handle search bar jump-to-message via UI store ─────────────────────
    // The search bar in TopBar sets jumpedMessageId in the UI store.
    // We need to trigger the full jumpToMessage flow (fetch window + scroll).
    const { jumpedMessageId, setJumpedMessageId } = useUIStore();

    useEffect(() => {
      if (!jumpedMessageId) return;

      messageWindow.jumpToMessage(jumpedMessageId);
      // Clear the store value so subsequent searches with the same ID still work
      setJumpedMessageId(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jumpedMessageId]);

    // ── Scroll to target after jump-to-message ────────────────────────────
    useEffect(() => {
      if (!messageWindow.highlightedMessageId) return;
      if (messageWindow.mode === "JUMPING") return;

      // Small delay to let messages render before scrolling to the target
      const scrollDelay = setTimeout(() => {
        scrollManager.scrollToMessage(messageWindow.highlightedMessageId!);
      }, 50);

      return () => clearTimeout(scrollDelay);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageWindow.highlightedMessageId, messageWindow.mode]);

    // ── External return-to-live trigger (from ChatInputBar send) ──────────
    useEffect(() => {
      if (returnToLiveTrigger === 0) return;
      messageWindow.returnToLive();
      // Delay scroll to allow live messages to render
      setTimeout(() => scrollManager.scrollToBottom("instant"), 100);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [returnToLiveTrigger]);

    // ── Media preview handler (Option A — lightbox logic in MessageList) ──
    const { openLightbox } = useUIStore();

    const handlePreviewMedia = useCallback(
      (url: string) => {
        const mediaItems = messageWindow.messages
          .filter(
            (message) =>
              (message.type?.startsWith("image/") ||
                message.type?.startsWith("video/")) &&
              message.file_url,
          )
          .map((message) => ({
            file_url: message.file_url as string,
            type: message.type as string,
            file_name: message.file_name,
          }));

        const index = mediaItems.findIndex((item) => item.file_url === url);
        openLightbox(mediaItems, index >= 0 ? index : 0);
      },
      [messageWindow.messages, openLightbox],
    );

    // ── Badge button handler ──────────────────────────────────────────────

    const handleBadgeClick = useCallback(() => {
      messageWindow.returnToLive();
      setTimeout(() => scrollManager.scrollToBottom("instant"), 100);
    }, [messageWindow, scrollManager]);

    const handleScrollDownClick = useCallback(() => {
      scrollManager.scrollToBottom();
    }, [scrollManager]);

    // ── Loading state ─────────────────────────────────────────────────────

    if (messageWindow.isInitialLoading && messageWindow.messages.length === 0) {
      return <ChatSkeleton />;
    }

    // ── Determine which floating button to show ───────────────────────────

    const showNewMessageBadge =
      messageWindow.mode === "HISTORY" && messageWindow.unreadCount > 0;

    const showScrollDownButton =
      !showNewMessageBadge &&
      !scrollManager.isNearBottom &&
      messageWindow.messages.length > 0;

    // ── Render ─────────────────────────────────────────────────────────────

    return (
      <div
        ref={viewportRef}
        className="flex-1 w-full relative h-full flex flex-col overflow-hidden"
      >
        {/* ── Floating bottom buttons ─────────────────────────────────── */}

        {showNewMessageBadge && (
          <button
            onClick={handleBadgeClick}
            className="absolute bottom-5 z-[2000] left-[50%] translate-x-[-50%] rounded-[10px] px-3 py-1.5 text-sm cursor-pointer border border-theme-border bg-theme-base/95 backdrop-blur-sm text-gray-300 transition-all duration-200 ease-out hover:bg-theme-hover active:scale-95 flex items-center gap-1.5 shadow-lg"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} className={cn("h-4 w-4")} />
            <span>
              {messageWindow.unreadCount}
              {messageWindow.unreadCount >= 50 ? "+" : ""} new message
              {messageWindow.unreadCount !== 1 ? "s" : ""}
            </span>
          </button>
        )}

        {showScrollDownButton && (
          <button
            onClick={handleScrollDownClick}
            className="absolute bottom-5 z-[2000] left-[50%] translate-x-[-50%] rounded-[10px] p-1 text-gray-400 cursor-pointer border border-theme-border bg-theme-base transition-all duration-200 ease-out hover:bg-theme-hover active:scale-95"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} className={cn("h-6 w-6")} />
          </button>
        )}

        {/* ── Pinned Date Header Overlay ──────────────────────────────── */}
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

        {/* ── Scrollable message area ─────────────────────────────────── */}
        <div
          ref={scrollManager.scrollContainerRef}
          onScroll={scrollManager.handleScroll}
          className="flex-1 w-full overflow-y-auto scroll-smooth px-4"
          style={{ overflowAnchor: "none" }}
        >
          <div className="flex flex-col min-h-full">
            {/* Spacer pushes messages to the bottom when there are few of them */}
            <div className="flex-1" />

            {/* ── Top loading indicator (older messages) ────────────── */}
            {messageWindow.isLoadingOlder && (
              <div className="flex items-center justify-center py-4">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            {/* ── Messages ────────────────────────────────── */}
            <div className="flex flex-col py-4">
              {messageWindow.messages.map((message, index) => {
                const previousMessage =
                  index > 0 ? messageWindow.messages[index - 1] : null;
                const nextMessage =
                  index < messageWindow.messages.length - 1
                    ? messageWindow.messages[index + 1]
                    : null;

                return (
                  <div key={message._id} data-index={index}>
                    <MessageItem
                      message={message}
                      prevMessage={previousMessage}
                      nextMessage={nextMessage}
                      user={user}
                      isCurrentUser={message.sender_id === user?.user_id}
                      color={color}
                      textColor={textColor}
                      onPreviewMedia={handlePreviewMedia}
                      onDeleteRequest={onDeleteRequest}
                      highlighted={
                        message._id === messageWindow.highlightedMessageId
                      }
                    />
                  </div>
                );
              })}
            </div>

            {/* ── Bottom loading spinner (newer messages) ─────────── */}
            {messageWindow.isLoadingNewer && (
              <div className="flex items-center justify-center py-4">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            {/* ── Typing indicator ────────────────────────────────── */}
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
                    .map((typingUser) => typingUser?.username)
                    .filter(Boolean)
                    .join(", ")}{" "}
                  {typingUsers.length === 1 ? "is" : "are"} typing...
                </span>
              </div>
            )}

            {/* Bottom sentinel — scroll target and intersection anchor */}
            <div ref={scrollManager.bottomAnchorRef} className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  },
);

MessageList.displayName = "MessageList";
