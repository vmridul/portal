import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "@/store/useUserStore";
export const handleLeaveRoom = async ({
  room_id,
  user,
  setLeaveDialog,
  router,
}: {
  room_id: string;
  user: User | null;
  setLeaveDialog?: (value: boolean) => void;
  router: ReturnType<typeof useRouter>;
}) => {
  if (!user) return;
  const { error } = await supabase
    .from("RoomMembers")
    .delete()
    .eq("room_id", room_id)
    .eq("user_id", user?.user_id);
  if (error) throw error;
  await supabase.from("Messages").insert({
    room_id,
    sender_id: user?.user_id,
    type: "leave",
    content: "left the room",
  });
  setLeaveDialog?.(false);
  toast.success("Room left successfully");
  router.push(`/portal`);
};
