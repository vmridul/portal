"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback } from "react";
import type { Id } from "@/convex/_generated/dataModel";

export interface PendingRequest {
  id: Id<"friends">;
  _creationTime: number;
  sender: {
    user_id: string;
    username: string;
    avatar?: string;
  } | null;
}

export interface SentRequest {
  id: Id<"friends">;
  _creationTime: number;
  receiver: {
    user_id: string;
    username: string;
    avatar?: string;
  } | null;
}

export interface ConvexFriend {
  id: Id<"friends">;
  friend: {
    user_id: string;
    username: string;
    avatar?: string;
  };
  last_msg?: string;
  updated_at?: string;
  _creationTime: number;
  unread_count: number;
}

export interface UseFriendsResult {
  friends: ConvexFriend[];
  pendingRequests: PendingRequest[];
  sentRequests: SentRequest[];
  isLoading: boolean;
}

export function useFriends(): UseFriendsResult {
  const friendsQuery = useQuery(api.friends.getFriends);
  const pendingRequestsQuery = useQuery(api.friends.getPendingRequests);
  const sentRequestsQuery = useQuery(api.friends.getSentRequests);

  return {
    friends: friendsQuery ?? [],
    pendingRequests: pendingRequestsQuery ?? [],
    sentRequests: sentRequestsQuery ?? [],
    isLoading: friendsQuery === undefined,
  };
}

export interface UseFriendActionsResult {
  sendRequest: (receiverId: string) => Promise<void>;
  acceptRequest: (requestId: Id<"friends">) => Promise<void>;
  rejectRequest: (requestId: Id<"friends">) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  isLoading: boolean;
}

export function useFriendActions(): UseFriendActionsResult {
  const sendRequestMutation = useMutation(api.friends.sendRequest);
  const acceptRequestMutation = useMutation(api.friends.acceptRequest);
  const rejectRequestMutation = useMutation(api.friends.rejectRequest);
  const removeFriendMutation = useMutation(api.friends.removeFriend);

  const sendRequest = useCallback(
    async (receiverId: string) => {
      await sendRequestMutation({ receiver_id: receiverId });
    },
    [sendRequestMutation]
  );

  const acceptRequest = useCallback(
    async (requestId: Id<"friends">) => {
      await acceptRequestMutation({ requestId });
    },
    [acceptRequestMutation]
  );

  const rejectRequest = useCallback(
    async (requestId: Id<"friends">) => {
      await rejectRequestMutation({ requestId });
    },
    [rejectRequestMutation]
  );

  const removeFriend = useCallback(
    async (friendId: string) => {
      await removeFriendMutation({ friend_id: friendId });
    },
    [removeFriendMutation]
  );

  return {
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    isLoading: false,
  };
}