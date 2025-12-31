"use client";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { pixelFont } from "@/app/page";

export default function Login({ redirect }: { redirect: string }) {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
  };

  return (
    <div className="z-[9999] absolute top-[430px] cursor-pointer left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-around items-center rounded-xl py-3 px-6">
      <button
        onClick={loginWithGoogle}
        className={`${pixelFont.className} portal-btn`}
      >
        Enter Portal
      </button>
    </div>
  );
}
