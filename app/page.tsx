"use client";
import Login from "@/components/ui/login";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pixelify_Sans } from "next/font/google";
import ChatBubbles from "@/components/ui/chatBubbles";
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

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

    // Setup Capacitor deep link listener for OAuth callback
    if (Capacitor.isNativePlatform()) {
      const listener = CapApp.addListener('appUrlOpen', async (event: any) => {
        console.log('App opened with URL:', event.url);

        // Handle Supabase OAuth callback
        if (event.url.includes('access_token') || event.url.includes('portal://auth/callback')) {
          const fragment = event.url.split('#')[1];

          if (fragment) {
            // Set the hash so Supabase can process the tokens
            window.location.hash = fragment;

            // Wait a bit for Supabase to process, then check session
            setTimeout(async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                router.replace("/portal");
              }
            }, 1000);
          }
        }
      });

      // Cleanup listener
      return () => {
        listener.then((l: any) => l.remove());
      };
    }
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