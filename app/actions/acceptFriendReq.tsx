import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
export const acceptFriendReq = async (req_id: string) => {
  const { data, error } = await supabase
    .from("Friends")
    .update({ status: "accepted" })
    .eq("id", req_id);

  if (error) throw error;
  toast.success("Friend request accepted");
};
