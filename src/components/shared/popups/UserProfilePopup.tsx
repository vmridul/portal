"use client";

import React, { useState, useCallback, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { getAvatarUrl } from "@/lib/utils/avatar";
import { useFriendActions, useFriends } from "@/hooks";
import { toast } from "sonner";
import Image from "next/image";

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface UserProfilePopupProps {
  user: User;
  isFriend?: boolean;
  currentUserId?: string;
  children: React.ReactNode;
}

function getInitials(username: string): string {
  const name = username.trim();
  const parts = name.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatJoinedDate(dateString: string): string {
  const date = new Date(dateString);
  return `Joined ${date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })}`;
}

export function UserProfilePopup({
  user,
  isFriend: isFriendProp,
  currentUserId,
  children,
}: UserProfilePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { sendRequest, removeFriend: removeFriendMutation } =
    useFriendActions();
  const { friends, sentRequests } = useFriends();

  const isCurrentUser = currentUserId === user.id;
  const isAlreadyFriend = useMemo(
    () => friends.some((f) => f.friend?.user_id === user.id),
    [friends, user.id],
  );
  const hasSentRequest = useMemo(
    () => sentRequests.some((s) => s.receiver?.user_id === user.id),
    [sentRequests, user.id],
  );
  const isFriend = isFriendProp ?? isAlreadyFriend;

  const handleSendRequest = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await sendRequest(user.id);
      toast.success("Friend request sent");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send request",
      );
    } finally {
      setIsLoading(false);
    }
  }, [sendRequest, user.id, isLoading]);

  const handleRemoveFriend = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await removeFriendMutation(user.id);
      setIsOpen(false);
      toast.success("Friend removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove friend",
      );
    } finally {
      setIsLoading(false);
    }
  }, [removeFriendMutation, user.id, isLoading]);

  const avatarSrc = getAvatarUrl(user.avatarUrl, user.username);

  if (isCurrentUser) {
    return <>{children}</>;
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <span className="cursor-pointer hover:text-gray-300">{children}</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={8}
          alignOffset={0}
          className="z-[9999] w-64 rounded-xl border border-theme-border bg-theme-surface animate-in fade-in duration-200"
          onEscapeKeyDown={() => setIsOpen(false)}
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest("button[data-friend-request]") ||
              target.closest("button[data-remove-friend]")
            ) {
              e.preventDefault();
            }
          }}
        >
          <div className="flex flex-col items-center p-4 gap-3">
            <div className="relative">
              {user.avatarUrl ? (
                <Image
                  src={avatarSrc}
                  width={40}
                  height={40}
                  alt={user.username}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-theme-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-theme-hover flex items-center justify-center ring-2 ring-theme-border">
                  <span className="text-lg font-semibold text-white">
                    {getInitials(user.username)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <h3 className="text-base font-semibold text-white truncate max-w-[200px]">
                {user.username}
              </h3>
              <span className="text-xs text-gray-400">
                {formatJoinedDate(user.joinedAt)}
              </span>
            </div>

            {isFriend ? (
              <button
                data-remove-friend
                onClick={handleRemoveFriend}
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isLoading ? "Removing..." : "Remove Friend"}
              </button>
            ) : hasSentRequest ? (
              <div className="w-full py-2 px-4 rounded-lg bg-theme-hover text-gray-400 text-sm text-center">
                Request Sent
              </div>
            ) : (
              <button
                data-friend-request
                onClick={handleSendRequest}
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-lg bg-theme-hover hover:bg-theme-hover/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-200 text-sm"
              >
                {isLoading ? "Sending..." : "Send Friend Request"}
              </button>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default UserProfilePopup;
