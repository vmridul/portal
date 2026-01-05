import { supabase } from "@/lib/supabase/client";

export async function getPendingRequests(user_id: string) {
  const { data, error } = await supabase
    .from("Friends")
    .select(
      `*, sender:Users!"Friends_user_id_fkey" (user_id, username, avatar)`
    )
    .eq("friend_id", user_id)
    .eq("status", "pending");

  if (error) throw error;

  return data;
}
