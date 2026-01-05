import { supabase } from "@/lib/supabase/client";

export const handleMsgDelete = async ({
  type,
  messageToDelete,
  user,
  setDeleteDialogOpen,
  setMessageToDelete,
}: {
  type: "room" | "friend";
  messageToDelete: string | null;
  user: any;
  setDeleteDialogOpen: (open: boolean) => void;
  setMessageToDelete: (messageToDelete: string | null) => void;
}) => {
  if (!messageToDelete) return;
  if (type === "room") {
    const { error } = await supabase
      .from("Messages")
      .delete()
      .eq("id", messageToDelete)
      .eq("sender_id", user?.user_id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("FriendMessages")
      .delete()
      .eq("id", messageToDelete)
      .eq("sender_id", user?.user_id);

    if (error) throw error;
  }

  setDeleteDialogOpen(false);
  setMessageToDelete(null);
};
