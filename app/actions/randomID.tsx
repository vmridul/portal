import { supabase } from "@/lib/supabase/client";
export async function generateRoomCode() {
  while (true) {
    const roomId = Math.floor(1000 + Math.random() * 9000);
    const { data, error } = await supabase
      .from("Rooms")
      .select("room_id")
      .eq("room_id", roomId)
      .limit(1);

    if (error) throw error;

    if (data.length === 0) {
      return roomId;
    }
  }
}
