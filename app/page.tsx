"use client";

import { Galindo, Lexend } from "next/font/google";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Image from "next/image";
import { useAuthFromFirebase } from "@/hooks/useAuthFromFirebase";
import { LandingTopGradient, LandingHeroIllustration } from "@/components/landing/LandingDecorations";

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
  const { isAuthenticated } = useAuthFromFirebase();

  const handleEnter = async () => {
    if (isAuthenticated) {
      router.push("/portal");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/portal");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <section className="h-screen bg-[#080e2a] overflow-y-auto overflow-x-hidden relative flex flex-col text-white">
      <div className="flex flex-col items-center">
        <LandingTopGradient />
        
        <div className="flex flex-col items-center mt-48 z-[1]">
          <span className={`${galindo.className} text-8xl`}>Portal</span>
          <span className="text-xl ">
            Realtime conversation without friction
          </span>
          <button
            onClick={handleEnter}
            className="cursor-pointer bg-white mt-4 bg-opacity-20 backdrop-blur-lg px-6 py-2 rounded-[8px] hover:bg-opacity-30 transition-all active:scale-95"
          >
            Enter
          </button>
        </div>

        <div className="relative z-[1] w-[90%] mt-12 mb-20 aspect-video max-w-7xl">
          <Image
            src="/assets/ss.png"
            fill
            priority
            style={{
              transform: "perspective(1000px) rotateX(5deg)",
              transformOrigin: "bottom center",
            }}
            className="rounded-[20px] shadow-2xl shadow-theme-base border border-theme-border object-cover"
            alt="Hero screenshot"
          />
        </div>

        <LandingHeroIllustration />
      </div>

      {/* Privacy section */}
      <div className="z-[1] ml-40 mt-32 relative">
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
        <Image
          className="absolute top-20 left-12"
          width={700}
          height={700}
          src="/assets/lock1.png"
          alt="lock"
        />
      </div>

      {/* Features section */}
      <div className="z-[1] flex flex-col items-center mt-[20%] w-full px-32 gap-12 pb-32">
        <span className={`text-7xl ${lexend.className}`}>Features</span>

        <div className="grid grid-cols-3 auto-rows-[120px] gap-3 w-full relative">
          <div className="row-span-2 col-span-2 flex flex-col items-start bg-[#0f0d14] border border-[#231b30] rounded-xl overflow-hidden relative">
            <span className="text-2xl text-gray-300 mt-6 ml-6">
              Beautifully crafted interface
            </span>
            <Image
              className="mt-4"
              width={900}
              height={500}
              src="/assets/card1.png"
              alt="Feature card"
            />
          </div>
          <div className="row-span-4 bg-[#0f0d14] border border-[#231b30] rounded-xl" />
          <div className="row-span-3 bg-[#0f0d14] border border-[#231b30] rounded-xl" />
          <div className="row-span-2 bg-[#0f0d14] border border-[#231b30] rounded-xl" />
          <div className="row-span-2 bg-[#0f0d14] border border-[#231b30] rounded-xl" />
        </div>
      </div>
    </section>
  );
}
