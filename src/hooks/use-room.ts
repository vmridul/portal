"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { RoomWithDetails, RoomMemberWithUser, UserRoom, Room } from "@/lib/types";
import { useCallback } from "react";

export interface UseRoomOptions {
  roomId: string | null;
}

export type ConvexRoomDetails = {
  _id?: unknown;
  room_id: string;
  room_name: string;
  is_group: boolean;
  memberCount?: number;
  owner_id?: string | null;
  joined_at?: number;
  unread_count?: number;
} | null;

export interface UseRoomResult {
  room: ConvexRoomDetails;
  members: RoomMemberWithUser[];
  isLoading: boolean;
}

export function useRoom(roomId: string | null): UseRoomResult {
  const roomDetailsQuery = useQuery(api.roomQueries.getRoomDetails, { room_id: roomId || "" });
  const roomMembersQuery = useQuery(api.roomQueries.getRoomMembers, { room_id: roomId || null });

  return {
    room: roomDetailsQuery ?? null,
    members: (roomMembersQuery ?? []) as RoomMemberWithUser[],
    isLoading: roomDetailsQuery === undefined,
  };
}

export interface UseUserRoomsOptions {
  userId: string | null;
}

export interface UseUserRoomsResult {
  rooms: UserRoom[];
  isLoading: boolean;
}

export function useUserRooms(userId: string | null): UseUserRoomsResult {
  const userRoomsQuery = useQuery(api.roomQueries.getUserRooms, { user_id: userId || null });

  return {
    rooms: (userRoomsQuery ?? []) as UserRoom[],
    isLoading: userRoomsQuery === undefined,
  };
}

export interface UseRoomActionsResult {
  joinRoom: (args: { room_id: string }) => Promise<void>;
  createRoom: (args: { room_name: string; room_id: string }) => Promise<void>;
  renameRoom: (args: { room_id: string; new_name: string }) => Promise<void>;
  leaveRoom: (args: { room_id: string }) => Promise<void>;
  deleteRoom: (args: { room_id: string }) => Promise<void>;
}

export function useRoomActions(): UseRoomActionsResult {
  const joinRoomMutation = useMutation(api.rooms.joinRoom);
  const createRoomMutation = useMutation(api.rooms.createRoom);
  const renameRoomMutation = useMutation(api.rooms.renameRoom);
  const leaveRoomMutation = useMutation(api.rooms.leaveRoom);
  const deleteRoomMutation = useMutation(api.rooms.deleteRoom);

  const joinRoom = useCallback(
    async ({ room_id }: { room_id: string }) => {
      await joinRoomMutation({ room_id });
    },
    [joinRoomMutation]
  );

  const createRoom = useCallback(
    async ({ room_name, room_id }: { room_name: string; room_id: string }) => {
      await createRoomMutation({ room_name, room_id });
    },
    [createRoomMutation]
  );

  const renameRoom = useCallback(
    async ({ room_id, new_name }: { room_id: string; new_name: string }) => {
      await renameRoomMutation({ room_id, new_name });
    },
    [renameRoomMutation]
  );

  const leaveRoom = useCallback(
    async ({ room_id }: { room_id: string }) => {
      await leaveRoomMutation({ room_id });
    },
    [leaveRoomMutation]
  );

  const deleteRoom = useCallback(
    async ({ room_id }: { room_id: string }) => {
      await deleteRoomMutation({ room_id });
    },
    [deleteRoomMutation]
  );

  return {
    joinRoom,
    createRoom,
    renameRoom,
    leaveRoom,
    deleteRoom,
  };
}

export function useRoomMembers(roomId: string | null): RoomMemberWithUser[] {
  const membersQuery = useQuery(api.roomQueries.getRoomMembers, { room_id: roomId || null });
  return (membersQuery ?? []) as RoomMemberWithUser[];
}

export function useRoomMemberCount(roomId: string | null): number {
  const membersQuery = useQuery(api.roomQueries.getRoomMembers, { room_id: roomId || null });
  return membersQuery?.length ?? 0;
}