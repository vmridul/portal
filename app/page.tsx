"use client";

import { Galindo, Lexend } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { UserButton, SignOutButton, Show, useAuth } from "@clerk/nextjs";
import {
  LandingTopGradient,
  LandingHeroIllustration,
} from "@/components/landing/LandingDecorations";
import { useUIStore } from "@/store/uiStore";
import { useEffect } from "react";
import { toast } from "sonner";

const galindo = Galindo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-galindo",
  display: "swap",
});

const lexend = Lexend({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setModal } = useUIStore();
  const { userId, isLoaded } = useAuth();
  const isAuthenticated = !!userId;

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      toast.success("Account deleted successfully");
      router.replace("/");
    }
  }, [searchParams, router]);

  const handleEnter = () => {
    if (isAuthenticated) {
      router.push("/portal");
      return;
    }
    router.push("/login");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleEnter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated]);

  return (
    <section className="h-screen bg-[#0f0d15] overflow-y-auto overflow-x-hidden relative flex flex-col text-white">
      <Show when="signed-in">
        <div className="absolute top-8 right-8 flex items-center gap-4 z-[100] px-4 py-2 rounded-full shadow-xl transition-all group">
          <div className="flex items-center gap-3 pr-2 ">
            <UserButton />
          </div>
          <SignOutButton>
            <button className="px-3 py-1  text-xs font-semibold rounded-full transition-all border border-white/5 text-gray-300 hover:text-white">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </Show>

      <div className="flex flex-col items-center">
        {/* <LandingTopGradient /> */}
        <Image
          className="absolute top-0 left-18 opacity-30 animate-fade-slow"
          width={1600}
          height={1200}
          src="/assets/asciiHero.png"
          alt="ascii"
        />

        <div className="flex flex-col items-center mt-[18%] z-[1]">
          <span className={`${galindo.className} text-8xl`}>Portal</span>
          <span className="text-xl text-gray-200">
            Realtime conversation without friction
          </span>
          <button
            onClick={handleEnter}
            className="cursor-pointer bg-[#4a31b0] mt-4 bg-opacity-90 backdrop-blur-lg px-6 py-2 rounded-[8px] hover:bg-opacity-80 hover:text-gray-200 transition-all active:scale-95"
          >
            Enter
          </button>
        </div>

        <div className="relative z-[1] w-[90%] mt-20 mb-20 aspect-video max-w-7xl">
          {/* <div className="w-full h-full">
            <RoomMockup />
          </div> */}
          <Image
            className="absolute z-[1] -top-16"
            width={2170}
            height={1430}
            src="/assets/macSS.png"
            alt="macSS"
          />
        </div>
      </div>

      {/* Privacy section */}
      <div className="flex items-center justify-between z-[1] ml-40 mt-16 relative">
        <div className="flex flex-col items-start">
          <span className={`text-7xl ${lexend.className}`}>
            Privacy
            <br /> First
          </span>
          <div className="flex flex-col gap-6 mt-6 relative">
            <div className="bg-[#0f0d15] w-fit z-[2] text-md rounded-[8px] px-6 py-2">
              End to end encryption
            </div>
            <div className="absolute top-8 left-12 h-10 z-[0]  border-l-2 border-dotted border-gray-500" />
            <div className="bg-[#0f0d15] w-fit z-[2] text-md rounded-[8px] px-6 py-2">
              No data collection
            </div>
            <div className="absolute top-24 left-12 h-10 z-[0]  border-l-2 border-dotted border-gray-500" />
            <div className="bg-[#0f0d15] w-fit z-[2] text-md rounded-[8px] px-6 py-2">
              No tracking
            </div>
          </div>
        </div>
        <Image
          className=""
          width={700}
          height={700}
          src="/assets/lock1.png"
          alt="lock"
        />
      </div>

      {/* Features section */}
      <div className="z-[1] flex flex-col items-center mt-[10%] w-full px-32 gap-12 pb-32">
        <span className={`text-7xl ${lexend.className}`}>Basics Covered</span>

        <div className="grid grid-cols-3 auto-rows-[120px] gap-3 w-full relative">
          <div className="row-span-2 col-span-2 flex flex-col items-start bg-[#0f0d14] border border-[#231b30] rounded-xl overflow-hidden relative">
            <span className="text-2xl text-gray-300 mt-6 ml-6">
              Beautifully crafted interface
            </span>
          </div>
          <div className="row-span-4 bg-[#0f0d14] border border-[#231b30] rounded-xl">
            {" "}
            <div className="row-span-2 col-span-2 flex flex-col items-start bg-[#0f0d14] rounded-xl overflow-hidden relative">
              <span className="text-2xl text-gray-300 mt-6 ml-6">
                Flawless on mobile too
              </span>
            </div>
          </div>
          <div className="row-span-2 bg-[#0f0d14] border border-[#231b30] rounded-xl">
            <div className="row-span-2 col-span-2 flex flex-col items-start bg-[#0f0d14] rounded-xl overflow-hidden relative">
              <span className="text-2xl text-gray-300 mt-6 ml-6">
                Realtime notifications
              </span>
            </div>
            <div />
          </div>
          <div className="row-span-1 bg-[#0f0d14] border border-[#231b30] rounded-xl">
            <div className="row-span-2 col-span-2 flex flex-col items-start bg-[#0f0d14] rounded-xl overflow-hidden relative">
              <span className="text-2xl text-gray-300 mt-6 ml-6">
                Typing Indicators
              </span>
            </div>
            <div />
          </div>
          <div className="row-span-1 bg-[#0f0d14] border border-[#231b30] rounded-xl">
            <div className="row-span-2 col-span-2 flex flex-col items-start bg-[#0f0d14] rounded-xl overflow-hidden relative">
              <span className="text-2xl text-gray-300 mt-6 ml-6">
                Online Presense
              </span>
            </div>
            <div />
          </div>
        </div>
      </div>
    </section>
  );
}
