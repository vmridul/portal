import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { getPendingRequests } from "@/app/actions/getPendingReq";
import { getSentRequests } from "@/app/actions/getSentRequests";
export function useFriends(userId: string) {
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!userId) return;
      const req = await getPendingRequests(userId);
      setPendingRequests(req);
    };
    const fetchSentRequests = async () => {
      if (!userId) return;
      const req = await getSentRequests(userId);
      setSentRequests(req);
    };
    fetchPendingRequests();
    fetchSentRequests();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    supabase
      .from("Friends")
      .select(
        `
        id,
        status,
        user_id,
        friend_id,
        last_msg,
        updated_at,
        user:Users!"Friends_user_id_fkey" (
          user_id,
          username,
          avatar
        ),
        friend:Users!"Friends_friend_id_fkey" (
          user_id,
          username,
          avatar
        )
      `
      )
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq("status", "accepted")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setFriends(
          data.map((row) => ({
            id: row.id,
            friend: row.user_id === userId ? row.friend : row.user,
            last_msg: row.last_msg,
            updated_at: row.updated_at,
          }))
        );
      });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`friends-realtime-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Friends",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          handleRealtimeEvent(payload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Friends",
          filter: `friend_id=eq.${userId}`,
        },
        (payload) => {
          handleRealtimeEvent(payload);
        }
      )
      .subscribe((status) => {});

    async function handleRealtimeEvent(payload: any) {
      /* ---------- INSERT ---------- */
      if (payload.eventType === "INSERT") {
        const row = payload.new;
        if (row.status !== "accepted") return;

        const { data: friendData, error } = await supabase
          .from("Friends")
          .select(
            `
        id,
        status,
        user_id,
        friend_id,
        last_msg,
        updated_at,
        user:Users!Friends_user_id_fkey (
          user_id,
          username,
          avatar
        ),
        friend:Users!Friends_friend_id_fkey (
          user_id,
          username,
          avatar
        )
      `
          )
          .eq("id", row.id)
          .single();

        if (error) throw error;

        setFriends((prev) => {
          if (prev.some((f) => f.id === friendData.id)) return prev;
          return [...prev, friendData].sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          );
        });
      }

      /* ---------- UPDATE ---------- */
      if (payload.eventType === "UPDATE") {
        const newRow = payload.new;
        if (newRow?.status !== "accepted") return;

        const { data: friendData, error } = await supabase
          .from("Friends")
          .select(
            `
      id,
      status,
      user_id,
      friend_id,
      last_msg,
      updated_at,
      user:Users!Friends_user_id_fkey (
        user_id,
        username,
        avatar
      ),
      friend:Users!Friends_friend_id_fkey (
        user_id,
        username,
        avatar
      )
    `
          )
          .eq("id", newRow.id)
          .single();

        if (error) return;

        const normalized = {
          id: friendData.id,
          friend:
            friendData.user_id === userId ? friendData.friend : friendData.user,
          last_msg: friendData.last_msg,
          updated_at: friendData.updated_at,
        };

        setFriends((prev) => {
          const updated = prev.filter((f) => f.id !== normalized.id);

          return [...updated, normalized].sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          );
        });
      }

      /* ---------- DELETE ---------- */
      if (payload.eventType === "DELETE") {
        const row = payload.old;
        setFriends((prev) => prev.filter((f) => f.id !== row.id));
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`friend-req-realtime-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Friends",
        },
        (payload) => {
          const newRow = payload.new as any | null;
          const oldRow = payload.old as any | null;
          const row = newRow ?? oldRow;
          if (!row) return;

          /* ---------- INSERT ---------- */
          if (payload.eventType === "INSERT" && row.status === "pending") {
            if (row.friend_id === userId) {
              getPendingRequests(userId).then((res) => {
                setPendingRequests(res);
              });
            }
            if (row.user_id === userId) {
              getSentRequests(userId).then((res) => {
                setSentRequests(res);
              });
            }
          }

          /* ---------- UPDATE ---------- */
          if (payload.eventType === "UPDATE") {
            if (oldRow?.status === "pending" && newRow?.status !== "pending") {
              getPendingRequests(userId).then((res) => {
                setPendingRequests(res);
              });
              getSentRequests(userId).then((res) => {
                setSentRequests(res);
              });
            }
          }

          /* ---------- DELETE ---------- */
          if (payload.eventType === "DELETE") {
            getPendingRequests(userId).then((res) => {
              setPendingRequests(res);
            });
            getSentRequests(userId).then((res) => {
              setSentRequests(res);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    setPendingRequests,
    setSentRequests,
  };
}
