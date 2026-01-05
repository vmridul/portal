import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
export const handleChangeRoomName = async ({
  room_id,
  newRoomName,
  setInfoDialog,
  setNewRoomName,
}: {
  room_id: string;
  newRoomName: string;
  setInfoDialog?: (value: boolean) => void;
  setNewRoomName?: (value: string) => void;
}) => {
  const { data, error } = await supabase
    .from("Rooms")
    .update({ room_name: newRoomName })
    .eq("room_id", room_id)
    .select()
    .single();

  if (error) throw error;
  setNewRoomName?.(data.room_name);
  setInfoDialog?.(false);
  toast.success("Changed room name");
};
