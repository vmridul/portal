"use client";
import LeftSidebar from "@/components/ui/leftSidebar";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { RoomsProvider } from "@/contexts/roomContext";
import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { usePathname } from "next/navigation";
import { ColorProvider } from "@/contexts/colorContext";
import Image from "next/image";
import { PresenceProvider } from "@/contexts/presenceContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/?redirect=${pathname}`);
        return;
      }
      const { data: profile } = await supabase
        .from("Users")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (profile) {
        setUser(profile);
      }
    };
    checkAuth();
  }, [router]);

  return (
    <ColorProvider>
      <PresenceProvider>
        <RoomsProvider user_id={user?.user_id || null}>
          <section className="flex font-sans bg-[#0f1320]">
            {/* <Image
            src="/assets/home.jpg"
            alt="home"
            priority
            fill
            className="absolute opacity-5  contrast-[1.3] inset-0 object-cover"
          /> */}
            <Suspense fallback={null}></Suspense>
            <div className="flex-1">{children}</div>
          </section>
        </RoomsProvider>
      </PresenceProvider>
    </ColorProvider>
  );
}
