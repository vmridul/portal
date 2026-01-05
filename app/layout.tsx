import "@/app/globals.css";

import { DM_Sans } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { PresenceProvider } from "@/contexts/presenceContext";

export const metadata: Metadata = {
  title: "Portal",
  description: "Realtime chat application",
  manifest: "/manifest.json",
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
    <html lang="en">
      <body className={`body ${dmSans.variable}`}>
        <div className="flex min-h-screen">
          <Suspense>
            <PresenceProvider>
              <main className="flex-1 font-sans">{children}</main>
              <Toaster theme="dark" position="top-center" />
            </PresenceProvider>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
