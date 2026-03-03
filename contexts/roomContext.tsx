"use client";
import { createContext, useContext, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RoomsContextType {
  rooms: any[];
  membersCount: Record<string, number>;
  refreshRooms: () => void;
}

const RoomsContext = createContext<RoomsContextType | undefined>(undefined);

export function RoomsProvider({
  children,
  user_id,
}: {
  children: React.ReactNode;
  user_id: string | null;
}) {
  const userRooms = useQuery(api.roomQueries.getUserRooms, { user_id: user_id || null });

  const { rooms, membersCount } = useMemo(() => {
    if (!userRooms) return { rooms: [], membersCount: {} };

    const countMap: Record<string, number> = {};
    const roomsList = userRooms.map((r: any) => {
      countMap[r.room_id] = r.memberCount;
      return r;
    });

    return { rooms: roomsList, membersCount: countMap };
  }, [userRooms]);

  return (
    <RoomsContext.Provider
      value={{ rooms, membersCount, refreshRooms: () => { } }}
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
