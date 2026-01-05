import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export const handleDeleteRoom = async ({
  room_id,
  router,
}: {
  room_id: string;
  router: ReturnType<typeof useRouter>;
}) => {
  const { data, error } = await supabase
    .from("Rooms")
    .delete()
    .eq("room_id", room_id);

  if (error) throw error;
  toast.success("Room deleted successfully");
  router.replace("/portal");
};
