import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
export const removeFriend = async (
  user_id: string | null,
  myId: string | null
) => {
  if (!myId || !user_id) return;
  const { error } = await supabase
    .from("Friends")
    .delete()
    .or(
      `and(user_id.eq.${myId},friend_id.eq.${user_id}),and(user_id.eq.${user_id},friend_id.eq.${myId})`
    );
  if (error) throw error;

  toast.success("Friend removed");
};
