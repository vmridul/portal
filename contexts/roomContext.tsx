"use client";
import { createContext, useContext, useMemo } from "react";
import { useUserRooms } from "@/hooks";

interface RoomsContextType {
  rooms: UserRoom[];
  membersCount: Record<string, number>;
  isLoading: boolean;
  refreshRooms: () => void;
}

type UserRoom = {
  room_id: string;
  memberCount: number;
  Rooms?: {
    room_name?: string;
    room_id?: string;
  } | null;
  owner_id?: string | null;
  joined_at?: number;
  unread_count?: number;
  last_msg_preview?: string;
  last_msg_time?: number;
};

const RoomsContext = createContext<RoomsContextType | undefined>(undefined);

export function RoomsProvider({
  children,
  user_id,
}: {
  children: React.ReactNode;
  user_id: string | null;
}) {
  const { rooms: userRooms, isLoading } = useUserRooms(user_id);

  const { rooms, membersCount } = useMemo(() => {
    if (!userRooms) return { rooms: [], membersCount: {} };

    const countMap: Record<string, number> = {};
    const roomsList = userRooms
      .map((r: UserRoom) => {
        countMap[r.room_id] = r.memberCount;
        return r;
      })
      .sort((a: UserRoom, b: UserRoom) => {
        const timeA = a.last_msg_time ?? a.joined_at ?? 0;
        const timeB = b.last_msg_time ?? b.joined_at ?? 0;
        return timeB - timeA;
      });

    return { rooms: roomsList, membersCount: countMap };
  }, [userRooms]);

  return (
    <RoomsContext.Provider
      value={{ rooms, membersCount, isLoading, refreshRooms: () => { } }}
    >
      {children}
    </RoomsContext.Provider>
  );
}

export function useRooms() {
  const context = useContext(RoomsContext);
  if (context === undefined) {
    throw new Error("useRooms must be used within RoomsProvider");
  }
  return context;
}
