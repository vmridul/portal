import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User } from "@/store/useUserStore";

export const handleChangeName = async ({
  user,
  newUsername,
  setUser,
  setNewUsername,
}: {
  user: User | null;
  newUsername: string;
  setUser: (user: User) => void;
  setNewUsername?: (value: string) => void;
}) => {
  if (!user) return;
  if (!newUsername) {
    toast.error("Enter a valid username!");
    return;
  }
  const { data, error } = await supabase
    .from("Users")
    .update({
      username: newUsername,
    })
    .eq("user_id", user?.user_id);
  if (error) throw error;
  setUser({ ...user, username: newUsername });
  setNewUsername?.(newUsername);
  toast.success("Username updated successfully");
};
