"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

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
  const [rooms, setRooms] = useState<Array<any>>([]);
  const [membersCount, setMembersCount] = useState<Record<string, number>>({});

  const fetchRooms = async () => {
    if (!user_id) return;
    const { data, error } = await supabase
      .from("RoomMembers")
      .select(
        `
        room_id,
        Rooms!"Room Members_room_id_fkey" (
          room_id,
          room_name,
          is_group,
          created_at
        )
      `
      )
      .eq("user_id", user_id)
      .order("joined_at", { ascending: false });
    if (error) throw error;
    setRooms(data);
  };

  const fetchCount = async () => {
    const roomIds = rooms.map((r) => r.room_id);
    const { data, error } = await supabase
      .from("RoomMembers")
      .select("room_id")
      .in("room_id", roomIds);

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data) {
      counts[row.room_id] = (counts[row.room_id] || 0) + 1;
    }
    setMembersCount(counts);
  };

  useEffect(() => {
    if (!user_id) return;

    const channel = supabase
      .channel(`user-rooms:${user_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "RoomMembers",
          filter: `user_id=eq.${user_id}`,
        },
        async (payload) => {
          const { data: roomData } = await supabase
            .from("Rooms")
            .select("*")
            .eq("room_id", payload.new.room_id)
            .single();

          if (roomData) {
            setRooms((prev) => [
              ...prev,
              {
                room_id: payload.new.room_id,
                Rooms: roomData,
              },
            ]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Rooms",
        },
        (payload) => {
          if (!payload.new?.room_id) return;

          setRooms((prev) =>
            prev.map((room) =>
              room.room_id === payload.new.room_id
                ? { ...room, Rooms: payload.new }
                : room
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "RoomMembers",
          filter: `user_id=eq.${user_id}`,
        },
        (payload) => {
          setRooms((prev) =>
            prev.filter((room) => room.room_id !== payload.old.room_id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user_id]);

  useEffect(() => {
    if (!rooms.length) return;

    const roomIds = new Set(rooms.map((r) => r.room_id));

    const channel = supabase
      .channel("room-members-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "RoomMembers",
        },
        (payload) => {
          const roomId = payload.new.room_id;
          if (!roomIds.has(roomId)) return;

          setMembersCount((prev) => ({
            ...prev,
            [roomId]: (prev[roomId] || 0) + 1,
          }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "RoomMembers",
        },
        (payload) => {
          const roomId = payload.old?.room_id;
          if (!roomIds.has(roomId)) return;

          setMembersCount((prev) => ({
            ...prev,
            [roomId]: Math.max((prev[roomId] || 1) - 1, 0),
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rooms]);

  useEffect(() => {
    fetchRooms();
  }, [user_id]);

  useEffect(() => {
    if (!rooms.length) return;
    fetchCount();
  }, [rooms]);

  return (
    <RoomsContext.Provider
      value={{ rooms, membersCount, refreshRooms: fetchRooms }}
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
