"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { RefObject } from "react";

interface HeroProps {
  handleEnter: () => void;
  dashboardRef: RefObject<HTMLDivElement | null>;
}

export function Hero({ handleEnter, dashboardRef }: HeroProps) {
  return (
    <section className="relative min-h-screen mt-12 p-6 text-white flex flex-col items-center">
      <div className="text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className=" text-gray-300 text-6xl mt-36"
        >
          Realtime Conversation
          <br />
          Without Friction
        </motion.p>

        <div className="flex items-center justify-center gap-3">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={handleEnter}
            className="cursor-pointer mt-8 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 transition-all duration-300 text-black rounded-xl  text-sm "
          >
            Enter
          </motion.button>
          <motion.div whileHover="hover" className="relative group mt-8">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.1,
                y: 0,
                rotate: -20,
                filter: "blur(4px)",
              }}
              variants={{
                hover: {
                  opacity: 1,
                  scale: 1,
                  y: -24,
                  rotate: 10,
                  filter: "blur(0px)",
                },
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none"
            >
              <Image
                src="/assets/star.png"
                alt="Star"
                width={32}
                height={32}
                className="opacity-100"
              />
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() =>
                window.open("https://github.com/vmridul/portal", "_blank")
              }
              className="relative z-10 cursor-pointer px-3 py-2.5 bg-[#2f2d30] hover:bg-[#262427] border border-white/5 border-dashed transition-all duration-300 text-white hover:text-gray-200 rounded-xl text-sm flex items-center gap-2"
            >
              Star on GitHub
              <Image
                src="/assets/github-icon-white.webp"
                alt="Git"
                width={20}
                height={20}
              />
            </motion.button>
          </motion.div>
        </div>
      </div>

      <div
        ref={dashboardRef}
        className="relative w-full flex justify-center mt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-[80%] rounded-5xl overflow-hidden"
        >
          <Image
            src="/assets/ss1.png"
            alt="ss"
            width={1000}
            height={600}
            className="w-full h-full object-contain rounded-[10px]"
          />
        </motion.div>
      </div>
    </section>
  );
}
