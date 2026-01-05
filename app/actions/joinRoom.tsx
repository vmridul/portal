import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import router from "next/router";
import { UUID } from "crypto";

export const handleJoin = async ({
  room_id,
  user_id,
  setJoinDialog,
  setRoomId,
  setMobileMenu,
}: {
  room_id: number | null;
  user_id: UUID;
  setJoinDialog?: (value: boolean) => void;
  setRoomId?: (value: number) => void;
  setMobileMenu?: (value: boolean) => void;
}) => {
  if (!room_id) {
    toast.error("Enter a Room ID!");
    return;
  }
  if (room_id < 1000 || room_id > 9999) {
    toast.error("Invalid Room ID!");
    return;
  }
  const { data: roomExist, error: roomExistError } = await supabase
    .from("Rooms")
    .select("room_id")
    .eq("room_id", room_id);

  if (roomExistError) throw roomExistError;
  if (roomExist.length === 0) {
    toast.error("Room does not exist");
    return;
  }
  const { data, error: checkError } = await supabase
    .from("RoomMembers")
    .select("user_id")
    .eq("room_id", room_id)
    .eq("user_id", user_id)
    .maybeSingle();
  if (checkError) throw checkError;
  if (data) {
    toast.error("You are already in this room");
    return;
  }

  const { error: memberError } = await supabase.from("RoomMembers").insert({
    room_id: room_id,
    role: "member",
  });
  if (memberError) throw memberError;
  await supabase.from("Messages").insert({
    room_id,
    sender_id: user_id,
    type: "join",
    content: "joined the room",
  });
  setJoinDialog?.(false);
  setRoomId?.(room_id);
  setMobileMenu?.(false);
  toast.success("Room joined successfully");
  router.push(`/home/room/${room_id}`);
};
