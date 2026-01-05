import { supabase } from "@/lib/supabase/client";
export const fetchMembers = async ({
  room_id,
  setMembers,
}: {
  room_id: string;
  setMembers: (data: any[]) => void;
}) => {
  const { data, error } = await supabase
    .from("RoomMembers")
    .select(
      `
    user_id,
    role,
    Users (
      user_id,
      username,
      avatar
    )
  `
    )
    .eq("room_id", room_id)
    .order("username", { foreignTable: "Users", ascending: true });

  if (error) throw error;
  setMembers(data);
};
