import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User } from "@/store/useUserStore";
import { uploadFile } from "./uploadFile";

export const handleChangeAvatar = async (
  file: File | null,
  user: User | null,
  setUser: (user: User) => void
) => {
  if (!user) return;
  if (!file) return;
  const { url: publicUrl } = await uploadFile({ file, bucket: "uploads" });
  const { data, error } = await supabase
    .from("Users")
    .update({
      avatar: publicUrl,
    })
    .eq("user_id", user?.user_id);

  if (error) throw error;
  setUser({ ...user, avatar: publicUrl });
  toast.success("Avatar updated successfully");
};
