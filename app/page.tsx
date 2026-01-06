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
        alert('URL received: ' + event.url);
        console.log('Full event:', JSON.stringify(event));

        // Handle Supabase OAuth callback
        if (event.url.includes('access_token')) {
          console.log('Access token found in URL');

          // Parse the URL properly
          try {
            // Replace custom scheme with https to parse as URL
            const url = new URL(event.url.replace('portal://', 'https://'));

            // Get hash params (tokens are in the hash)
            const hashParams = new URLSearchParams(url.hash.substring(1));

            const access_token = hashParams.get('access_token');
            const refresh_token = hashParams.get('refresh_token');

            console.log('Extracted tokens:', {
              hasAccessToken: !!access_token,
              hasRefreshToken: !!refresh_token
            });

            if (access_token && refresh_token) {
              // Set the session directly using Supabase
              const { data, error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });

              console.log('Session set result:', {
                hasSession: !!data.session,
                error: error?.message
              });

              if (data.session) {
                console.log('Successfully signed in, redirecting to portal');
                router.replace("/portal");
              } else {
                console.error('Failed to create session:', error);
              }
            } else {
              console.error('Missing tokens in URL');
            }
          } catch (error) {
            console.error('Error parsing auth URL:', error);
          }
        }
      });

      // Cleanup listener
      return () => {
        listener.then(l => l.remove());
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