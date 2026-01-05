import { toast } from "sonner";
import { generateRoomCode } from "./randomID";
import { supabase } from "@/lib/supabase/client";
import { User } from "@/store/useUserStore";
import { useRouter } from "next/navigation";

export const handleCreate = async ({
  roomName,
  user,
  setCreateDialog,
  setRoomName,
  setMobileMenu,
  router,
}: {
  roomName: string;
  user: User | null;
  setCreateDialog?: (value: boolean) => void;
  setRoomName?: (value: string) => void;
  setMobileMenu?: (value: boolean) => void;
  router: ReturnType<typeof useRouter>;
}) => {
  if (!user) return;
  if (!roomName) {
    toast.error("Enter a valid room name!");
    return;
  }
  try {
    const room_id = await generateRoomCode();
    const { data, error } = await supabase
      .from("Rooms")
      .insert([
        {
          room_name: roomName,
          room_id: room_id,
          is_group: true,
        },
      ])
      .select()
      .single();

    const { error: memberError } = await supabase.from("RoomMembers").insert({
      room_id: room_id,
      user_id: user?.user_id,
      role: "owner",
    });

    if (error) {
      console.error(error);
    }
    if (memberError) throw memberError;
    setCreateDialog?.(false);
    setRoomName?.("");
    toast.success("Room created successfully");
    setMobileMenu?.(false);
    router.push(`/home/room/${room_id}`);
  } catch (err) {
    console.error("Error creating room:", err);
  }
};
