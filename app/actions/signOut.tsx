import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export const handleSignOut = async () => {
  try {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    window.location.href = "/";
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
