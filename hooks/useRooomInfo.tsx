"use client";

import { useRooms } from "@/contexts/roomContext";
import { useEffect, useMemo, useState } from "react";
import { fetchMembers } from "@/app/actions/fetchMembers";

export function useRoomInfo(room_id?: string) {
  const { rooms, membersCount } = useRooms();
  const [members, setMembers] = useState<any[]>([]);

  const room = useMemo(
    () => rooms.find((room) => room?.Rooms?.room_id == room_id),
    [rooms, room_id]
  );

  const memberCount = room ? membersCount[room.room_id] ?? 0 : 0;
  const roomName = room?.Rooms?.room_name;
  const createdAt = room?.Rooms?.created_at;
  const owner = members.find((m) => m.role === "owner");
  const owner_id = owner?.user_id;
  const ownerName = owner?.Users?.username;

  useEffect(() => {
    if (!room_id) return;
    fetchMembers({ room_id, setMembers });
  }, [room_id]);

  return {
    room,
    createdAt,
    roomName,
    memberCount,
    owner_id,
    ownerName,
    members,
    setMembers,
  };
}
