"use client";

import { motion } from "framer-motion";

const privacy = ["Encrypted Calls", "No Tracking", "No Data Collection"];

export function Privacy() {
  return (
    <section className="relative md:mt-32 text-white overflow-hidden">
      <h2 className="text-center text-3xl md:text-6xl flex justify-center gap-4">
        <motion.span
          initial={{ opacity: 0, x: 100, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.8,
          }}
          viewport={{ once: true }}
        >
          Privacy
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: 100, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.8,
            delay: 0.2,
          }}
          viewport={{ once: true }}
        >
          First
        </motion.span>
      </h2>

      <div className="md:mt-20 mt-8 max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {privacy.map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: i * 0.15,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            viewport={{ once: true }}
            className="relative h-64 w-full md:w-82 bg-[#0a0a0d] shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] rounded-3xl flex items-center justify-center text-center px-12"
          >
            <span className="text-xl md:text-xl  text-white leading-snug max-w-[160px]">
              {text}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
