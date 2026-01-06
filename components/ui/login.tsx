"use client";
import { supabase } from "@/lib/supabase/client";


export default function Login({ redirect }: { redirect: string }) {
  const loginWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/portal`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  return (
    <div className="z-[9999] ml-1 cursor-pointer flex justify-around items-center rounded-xl">
      <button onClick={loginWithGoogle} className="animated-btn">
        <span className="span-mother">
          <span>E</span>
          <span>N</span>
          <span>T</span>
          <span>E</span>
          <span>R</span>
        </span>

        <span className="span-mother2">
          <span>P</span>
          <span>O</span>
          <span>R</span>
          <span>T</span>
          <span>A</span>
          <span>L</span>
        </span>
      </button>
    </div>
  );
}
