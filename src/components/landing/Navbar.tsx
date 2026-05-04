import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SignOutButton, Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Galindo } from "next/font/google";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

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
  const [isOpen, setIsOpen] = useState(false);

  const navItems = (
    <>
      <Show when="signed-out">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-2">
          <button
            onClick={() =>
              window.open("https://github.com/vmridul/portal", "_blank")
            }
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all bg-[#2f2d30] hover:bg-[#262427] border border-white/5 border-dashed text-gray-200 hover:text-white w-full md:w-auto justify-center"
          >
            <Image
              src="/assets/github-icon-white.webp"
              alt="Git"
              width={20}
              height={20}
            />
            <span className="md:hidden">GitHub</span>
          </button>

          <SignUpButton>
            <button className="flex items-center justify-center px-4 py-2 text-sm rounded-lg border border-white/10 border-dashed text-white hover:bg-white/5 transition-colors duration-300 w-full md:w-auto">
              Sign up
            </button>
          </SignUpButton>
          <SignInButton forceRedirectUrl="/portal">
            <button className="flex items-center justify-center px-4 py-2 text-sm rounded-lg bg-white text-black hover:bg-gray-200 transition-colors duration-300 w-full md:w-auto">
              Sign in
            </button>
          </SignInButton>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-2">
          <button
            onClick={() =>
              window.open("https://github.com/vmridul/portal", "_blank")
            }
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all bg-[#2f2d30] hover:bg-[#262427] border border-white/5 border-dashed text-gray-200 hover:text-white w-full md:w-auto justify-center"
          >
            <Image
              src="/assets/github-icon-white.webp"
              alt="Git"
              width={20}
              height={20}
            />
            <span className="md:hidden">GitHub</span>
          </button>
          <SignOutButton>
            <button className="px-3 py-2 text-sm rounded-lg transition-all border border-dashed border-white/5 text-gray-200 hover:text-white w-full md:w-auto">
              Sign Out
            </button>
          </SignOutButton>
          {scrolled && (
            <button
              onClick={() => {
                handleEnter();
                setIsOpen(false);
              }}
              className="px-4 py-2 text-sm rounded-lg transition-all bg-white text-black hover:bg-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full md:w-auto"
            >
              Enter
            </button>
          )}
        </div>
      </Show>
    </>
  );

  return (
    <motion.div
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 ${
        scrolled || isOpen
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

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">{navItems}</div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
        >
          <HugeiconsIcon icon={isOpen ? Cancel01Icon : Menu01Icon} size={24} />
        </button>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-[#0a080b] overflow-hidden"
          >
            <div className="px-6 pb-4 flex flex-col gap-6">{navItems}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
