"use client";
import Login from "@/components/ui/login";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pixelify_Sans } from "next/font/google";
import ChatBubbles from "@/components/ui/chatBubbles";

export const pixelFont = Pixelify_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export default function Page() {
  const searchParams = useSearchParams();
  const redirectParms = searchParams.get("redirect");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/portal");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center md:justify-normal bg-[#2a1c55]">
      <div className="z-[400] absolute inset-0 bg-pattern opacity-5" />
      <ChatBubbles />
      <div className="z-[9999] mb-[140px] ml-0 md:ml-20 gap-6 flex items-center md:items-start flex-col">
        <div className="">
          <div className={`${pixelFont.className} text-white text-7xl md:text-8xl`}>
            Portal
          </div>
          <div className="ml-1 text-[#dacdfb] text-sm md:text-lg font-sans">
            Realtime conversation without friction
          </div>
        </div>
        <Login redirect={redirectParms ?? "/portal"} />
      </div>
    </div>
  );
}
