import { supabase } from "@/lib/supabase/client";

export const fetchMessages = async ({
  type,
  room_id,
  setMessages,
  setOldestCursor,
  PAGE_SIZE,
}: {
  type: "room" | "friend";
  room_id: string;
  setMessages: (messages: Array<any>) => void;
  setOldestCursor: (cursor: string | null) => void;
  PAGE_SIZE: number;
}) => {
  if (type === "room") {
    const { data, error } = await supabase
      .from("Messages")
      .select(
        `
      *,
      sender:Users!sender_id (
        user_id,
        avatar,
        username
      )
    `
      )
      .eq("room_id", room_id)
      .order("sent_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) throw error;
    if (!data || data.length === 0) return;
    setMessages(data.reverse());
    setOldestCursor(data[data.length - 1].sent_at);
  } else {
    const { data, error } = await supabase
      .from("FriendMessages")
      .select(
        `
    *,
    receiver:Users!"FriendMessages_sender_id_fkey" (
      user_id,
      avatar,
      username
    )
  `
      )
      .or(`receiver_id.eq.${room_id},sender_id.eq.${room_id}`)
      .order("sent_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) throw error;
    if (!data || data.length === 0) return;
    setMessages(data.reverse());
    setOldestCursor(data[data.length - 1].sent_at);
  }
};
