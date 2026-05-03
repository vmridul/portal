"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SignOutButton, Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Galindo } from "next/font/google";

const galindo = Galindo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-galindo",
  display: "swap",
});

interface NavbarProps {
  scrolled: boolean;
  handleEnter: () => void;
}

export function Navbar({ scrolled, handleEnter }: NavbarProps) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#0a080b] border-b border-white/10 py-0 shadow-2xl"
          : "bg-transparent border-transparent py-2"
      }`}
    >
      <div className="flex justify-between items-center px-6 py-4 max-w-6xl w-[90%] mx-auto">
        <div className="flex items-center gap-3">
          <span
            className={`text-2xl text-white ${galindo.className} font-medium tracking-wide`}
          >
            Portal
          </span>
        </div>
        <Show when="signed-out">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                window.open("https://github.com/vmridul/portal", "_blank")
              }
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all bg-[#2f2d30] hover:bg-[#262427] border border-white/5 border-dashed text-gray-200 hover:text-white"
            >
              <Image
                src="/assets/github-icon-white.webp"
                alt="Git"
                width={20}
                height={20}
              />
            </button>

            <SignUpButton>
              <button className="flex items-center justify-center px-4 py-2 text-sm rounded-lg border border-white/10 border-dashed text-white hover:bg-white/5 transition-colors duration-300">
                Sign up
              </button>
            </SignUpButton>
            <SignInButton forceRedirectUrl="/portal">
              <button className="flex items-center justify-center px-4 py-2 text-sm rounded-lg bg-white text-black hover:bg-gray-200 transition-colors duration-300">
                Sign in
              </button>
            </SignInButton>
          </div>
        </Show>
        <Show when="signed-in">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                window.open("https://github.com/vmridul/portal", "_blank")
              }
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all bg-[#2f2d30] hover:bg-[#262427] border border-white/5 border-dashed text-gray-200 hover:text-white"
            >
              <Image
                src="/assets/github-icon-white.webp"
                alt="Git"
                width={20}
                height={20}
              />
            </button>
            <SignOutButton>
              <button className="px-3 py-2 text-sm rounded-lg transition-all border border-dashed border-white/5 text-gray-200 hover:text-white">
                Sign Out
              </button>
            </SignOutButton>
            {scrolled && (
              <button
                onClick={handleEnter}
                className="px-4 py-2 text-sm rounded-lg transition-all bg-white text-black hover:bg-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                Enter
              </button>
            )}
          </div>
        </Show>
      </div>
    </motion.div>
  );
}
