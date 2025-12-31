"use client";
import Login from "@/components/ui/login";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Press_Start_2P } from "next/font/google";

export const pixelFont = Press_Start_2P({
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
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.replace("/home");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="z-[400] absolute inset-0 bg-[#0a0a0a] bg-opacity-50 backdrop-blur-md" />
      <div
        className={`z-[500] ${pixelFont.className} text-white flex flex-col items-center justify-center absolute top-[200px] left-1/2 transform -translate-x-1/2`}
      >
        <h1 className={`text-8xl font-bold relative`}>PORTAL</h1>
        <h1
          className={`text-8xl font-bold absolute z-[-1] top-2 left-0 text-black`}
        >
          PORTAL
        </h1>
        <div className="text-2xl mt-4 flex flex-col items-center text-violet-400">
          <div className="flex gap-3 items-center">
            <span className="">Realtime</span>
            <Image
              src="/assets/chat_icon.png"
              alt="chat"
              width={40}
              height={40}
              className="mt-1"
            />
            <span className="text-white">conversation</span>
          </div>
          <span className="">without friction</span>
        </div>
      </div>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/assets/landing_bg.png"
        className="absolute z-[300] scale-110 translate-x-7  inset-0 w-full h-full object-fill"
      >
        <source src="/assets/landing_bg.mp4" type="video/mp4" />
      </video>
      <Login redirect={redirectParms ?? ""} />
    </div>
  );
}
