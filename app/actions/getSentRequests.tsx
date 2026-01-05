import { supabase } from "@/lib/supabase/client";
export const getSentRequests = async (user_id: string) => {
  const { data, error } = await supabase
    .from("Friends")
    .select(
      `*, receiver:Users!"Friends_friend_id_fkey" (user_id, username, avatar)`
    )
    .eq("user_id", user_id)
    .eq("status", "pending");

  if (error) throw error;

  return data;
};
