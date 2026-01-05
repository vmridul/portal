import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import normalizeUUID from "./normalizeUUID";

export async function sendFriendRequest(user_id: string, friend_id: string) {
  const uid = normalizeUUID(user_id);
  const fid = normalizeUUID(friend_id);
  if (!uid || !fid) {
    toast.error("Enter a valid User ID!");
    return;
  }
  const { data: existing, error: checkError } = await supabase
    .from("Friends")
    .select("status")
    .or(
      `and(user_id.eq.${uid},friend_id.eq.${fid}),and(user_id.eq.${fid},friend_id.eq.${uid})`
    )
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    if (existing.status === "pending") {
      toast.info("Friend request already sent");
      return;
    }

    if (existing.status === "accepted") {
      toast.info("You are already friends");
      return;
    }
  }
  const { data, error } = await supabase
    .from("Friends")
    .insert({
      user_id: uid,
      friend_id: fid,
      status: "pending",
    })
    .select();
  if (error) throw error;
  toast.success("Friend request sent");
}
