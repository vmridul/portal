"use client";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RoomsProvider } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { usePathname } from "next/navigation";
import { ColorProvider } from "@/contexts/colorContext";
import NotificationListener from "@/components/features/notifications/NotificationListener";
import { useColor } from "@/contexts/colorContext";
import PortalShellSkeleton from "@/components/shared/skeletons/PortalShellSkeleton";
import { GlobalModals } from "@/components/layout/GlobalModals";

function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const pathname = usePathname();
  const { isThemeReady } = useColor();
  const isRoomPage = pathname.startsWith("/portal/room");

  const { isAuthenticated, isLoading } = useConvexAuth();

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

  if ((isLoading || !isThemeReady || profile === undefined || !user?.user_id) && !isRoomPage) {
    return <PortalShellSkeleton />;
  }

  if (!user?.user_id) {
    return null;
  }

  return (
    <RoomsProvider user_id={user.user_id}>
      <section className="flex font-sans bg-theme-surface">
        <GlobalModals />
        <Suspense fallback={null}></Suspense>
        <NotificationListener />
        <div className="flex-1">{children}</div>
      </section>
    </RoomsProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ColorProvider>
      <PortalLayoutContent>{children}</PortalLayoutContent>
    </ColorProvider>
  );
}
