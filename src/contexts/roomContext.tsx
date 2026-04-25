import { createContext, useContext, useMemo } from "react";
import { useUserRooms } from "@/hooks";
import type { UserRoom } from "@/lib/types/room";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RoomsContextType {
  rooms: UserRoom[];
  membersCount: Record<string, number>;
  isLoading: boolean;
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
  const { rooms: userRooms, isLoading: roomsLoading } = useUserRooms(user_id);

  const { rooms, membersCount, isLoading } = useMemo(() => {
    if (!userRooms) return { rooms: [], membersCount: {}, isLoading: roomsLoading };

    const countMap: Record<string, number> = {};
    const roomsList = userRooms
      .map((r: UserRoom) => {
        countMap[r.room_id] = r.memberCount;
        return r;
      })
      .sort((a: UserRoom, b: UserRoom) => {
        const timeA = a.joined_at ?? 0;
        const timeB = b.joined_at ?? 0;
        return timeB - timeA;
      });

    return { rooms: roomsList, membersCount: countMap, isLoading: roomsLoading };
  }, [userRooms, roomsLoading]);

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