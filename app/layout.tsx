import "@/app/globals.css";

import { DM_Sans, Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { PresenceProvider } from "@/contexts/presenceContext";
import ConvexClientProvider from "./ConvexClientProvider";
import { cn } from "@/lib/utils";
import { getThemeBootstrapScript } from "@/lib/theme";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
      </head>
      <body suppressHydrationWarning className={`body ${dmSans.variable}`}>
        <div className="flex min-h-screen">
          <ConvexClientProvider>
            <Suspense>
              <PresenceProvider>

                <main className="flex-1 font-sans">{children}</main>
                <Toaster theme="dark" position="top-center" />

              </PresenceProvider>
            </Suspense>
          </ConvexClientProvider>
        </div>
      </body>
    </html>
  );
}
