"use client";
import { createContext, useContext, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  const userRooms = useQuery(api.roomQueries.getUserRooms, { user_id: user_id || null });
  const isLoading = !!user_id && userRooms === undefined;

  const { rooms, membersCount } = useMemo(() => {
    if (!userRooms) return { rooms: [], membersCount: {} };

    const countMap: Record<string, number> = {};
    const roomsList = userRooms.map((r: UserRoom) => {
      countMap[r.room_id] = r.memberCount;
      return r;
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
