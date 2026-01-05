import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
export const rejectFriendReq = async (req_id: string, type: string) => {
  const { error } = await supabase.from("Friends").delete().eq("id", req_id);

  if (error) throw error;

  if (type === "toast") {
    toast.info("Friend request rejected");
  }
};
