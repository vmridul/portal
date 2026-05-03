"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import PixelBlast from "@/components/PixelBlast";
import { Galindo } from "next/font/google";

const galindo = Galindo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-galindo",
  display: "swap",
});

export function Footer() {
  return (
    <section className="h-96 w-full bg-white flex justify-end relative">
      <div className="flex-1 p-20 relative z-[1001]">
        <span className={`${galindo.className} text-black text-4xl`}>
          Portal
        </span>
        <span className="text-gray-400 block text-sm">
          Realtime conversation
          <br />
          without friction
        </span>
        <div className="flex gap-4 mt-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center p-2 rounded-lg bg-white border border-black/10 hover:bg-gray-100/30 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.04),inset_0_-4px_10px_rgba(0,0,0,0.02)] cursor-pointer"
            onClick={() => window.open("https://github.com/vmridul", "_blank")}
          >
            <Image
              src="/assets/github-icon.png"
              alt="Github"
              width={20}
              height={20}
            />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center p-2 rounded-lg bg-white border border-black/10 hover:bg-gray-100/30 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.04),inset_0_-4px_10px_rgba(0,0,0,0.02)] cursor-pointer"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/in/mridul-verma-a875aa256/",
                "_blank",
              )
            }
          >
            <Image
              src="/assets/linkdin-icon.png"
              alt="Linkedin"
              width={20}
              height={20}
            />
          </motion.button>
        </div>
      </div>
      <div className="w-[75%] inset-0 z-[1000] overflow-hidden">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#000000"
          patternScale={2}
          patternDensity={1}
          enableRipples
          rippleSpeed={0.3}
          rippleThickness={0.1}
          rippleIntensityScale={1}
          speed={0.3}
          transparent
          edgeFade={0.25}
        />
      </div>
    </section>
  );
}
