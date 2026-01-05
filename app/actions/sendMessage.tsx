import { supabase } from "@/lib/supabase/client";
import { uploadFile } from "./uploadFile";

export const sendMessage = async ({
  type,
  msg,
  selectedFile,
  setUploading,
  channelRef,
  user,
  username,
  room_id,
  setMsg,
  setSelectedFile,
  fileInputRef,
}: {
  type: "room" | "friend";
  msg: string;
  selectedFile: File | null;
  setUploading?: (uploading: boolean) => void;
  channelRef: any;
  user: any;
  username: string;
  room_id: string;
  setMsg: (msg: string) => void;
  setSelectedFile?: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  if (!msg && !selectedFile) return;
  setUploading?.(true);

  if (channelRef.current) {
    channelRef.current.track({
      user: user?.user_id,
      username,
      typing: false,
    });
  }
  try {
    let fileUrl = null;
    let fileType = null;
    let fileName = null;

    if (selectedFile) {
      const result = await uploadFile({
        file: selectedFile,
        bucket: "chat-files",
      });
      fileUrl = result.url;
      fileType = selectedFile.type;
      fileName = result.originalName;
    }

    if (type === "room") {
      const { error: sendMsgError } = await supabase.from("Messages").insert({
        room_id: room_id,
        sender_id: user?.user_id,
        content: msg || null,
        file_url: fileUrl,
        type: fileType,
        file_name: fileName,
      });
      if (sendMsgError) throw sendMsgError;
    } else {
      const { error: sendMsgError } = await supabase
        .from("FriendMessages")
        .insert({
          receiver_id: room_id,
          sender_id: user?.user_id,
          content: msg || null,
          file_url: fileUrl,
          type: fileType,
          file_name: fileName,
        });
      if (sendMsgError) throw sendMsgError;
    }

    setMsg("");
    setSelectedFile?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    setUploading?.(false);
  }
};
