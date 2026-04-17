import "@/app/globals.css";

import { DM_Sans, Inter, Lexend } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { PresenceProvider } from "@/contexts/presenceContext";
import ConvexClientProvider from "./ConvexClientProvider";
import { cn } from "@/lib/utils";
import { getThemeBootstrapScript } from "@/lib/theme";
import { ColorProvider } from "@/contexts/colorContext";
import { GlobalModals } from "@/components/layout/GlobalModals";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Portal",
  description: "Realtime chat application",
  icons: {
    icon: "/assets/favicon.ico",
  },
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, dmSans.variable, lexend.variable)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
      </head>
      <body suppressHydrationWarning className={`body`}>
        <div className="flex min-h-screen">
          <ConvexClientProvider>
            <Suspense>
              <PresenceProvider>
                <ColorProvider>
                  <GlobalModals />
                  <main className="flex-1 font-sans">{children}</main>
                  <Toaster theme="dark" position="top-center" />
                </ColorProvider>
              </PresenceProvider>
            </Suspense>
          </ConvexClientProvider>
        </div>
      </body>
    </html>
  );
}
