"use client";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RoomsProvider } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { usePathname } from "next/navigation";
import { ColorProvider } from "@/contexts/colorContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const pathname = usePathname();

  const { isAuthenticated, isLoading } = useConvexAuth();

  // Get user info directly from Convex using the current auth token
  const profile = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/?redirect=${pathname}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  useEffect(() => {
    if (profile) {
      setUser(profile);
    }
  }, [profile, setUser]);

  return (
    <ColorProvider>
      <RoomsProvider user_id={user?.user_id || null}>
        <section className="flex font-sans bg-theme-surface">
          <Suspense fallback={null}></Suspense>
          <div className="flex-1">{children}</div>
        </section>
      </RoomsProvider>
    </ColorProvider>
  );
}
