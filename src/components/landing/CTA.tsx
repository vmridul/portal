"use client";

import { motion } from "framer-motion";
import { AsciiArt } from "@/components/ui";

interface CTAProps {
  handleEnter: () => void;
}

export function CTA({ handleEnter }: CTAProps) {
  return (
    <section className="py-8 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex relative flex-col items-center text-center">
          <div className="max-w-3xl mb-24 items-center flex flex-col ">
            <h2 className="text-5xl md:text-6xl text-white tracking-tight leading-[1.05]">
              Ready to Dive In?
            </h2>
            <div className="relative mt-8">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/10 blur-2xl rounded-full pointer-events-none" />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={handleEnter}
                className="relative z-10 cursor-pointer px-6 py-3 bg-gray-100 text-black rounded-xl text-sm font-medium shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300"
              >
                Enter
              </motion.button>
            </div>
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="absolute top-12 right-20"
            >
              <AsciiArt size="md" color="text-white/40" />
            </motion.div>
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98],
                delay: 0.15,
              }}
              className="absolute top-12 left-48"
            >
              <AsciiArt size="sm" color="text-white/30" inverted />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
