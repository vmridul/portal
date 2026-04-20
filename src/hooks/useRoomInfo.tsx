"use client";

import { useRooms } from "@/contexts/roomContext";
import { useMemo } from "react";
import { useRoomMembers } from "@/hooks";

export function useRoomInfo(room_id?: string) {
  const { rooms, membersCount } = useRooms();

  const room = useMemo(
    () => rooms.find((room) => room?.room_id == room_id),
    [rooms, room_id]
  );

  const memberCount = room ? membersCount[room.room_id] ?? 0 : 0;
  const roomName = room?.Rooms?.room_name;
  const createdAt = room?.joined_at;

  const members = useRoomMembers(room_id || null);

  const owner = members?.find((m) => m.role === "owner");
  const owner_id = owner?.user_id;
  const ownerName = owner?.Users?.username;

  return {
    room,
    createdAt,
    roomName,
    memberCount,
    owner_id,
    ownerName,
    members,
    setMembers: undefined,
  };
}
