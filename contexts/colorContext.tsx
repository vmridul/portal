"use client";
import { supabase } from "@/lib/supabase/client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { UUID } from "crypto";

interface ColorContextType {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: ReactNode }) {
  const [color, setColor] = useState<string>("");
  const [user_id, setUserId] = useState<string>();

  useEffect(() => {
    const fetchColor = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id);

      const { data, error } = await supabase
        .from("Users")
        .select("chatColor")
        .eq("user_id", user?.id)
        .single();
      setColor(data?.chatColor);
    };
    fetchColor();
  }, []);

  useEffect(() => {
    if (!user_id) return;
    const updateColor = async () => {
      const { error } = await supabase
        .from("Users")
        .update({ chatColor: color })
        .eq("user_id", user_id);
      if (error) throw error;
    };
    updateColor();
  }, [color]);

  return (
    <ColorContext.Provider value={{ color, setColor }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const ctx = useContext(ColorContext);
  if (!ctx) {
    throw new Error("useColor must be used inside ColorProvider");
  }
  return ctx;
}
