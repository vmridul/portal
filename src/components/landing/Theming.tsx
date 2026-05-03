"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { FullAppMock } from "@/components/mocks";
import { useColor } from "@/contexts/colorContext";

interface ThemingProps {
  colorDialog: boolean;
  setColorDialog: (val: boolean | ((v: boolean) => boolean)) => void;
}

export function Theming({ colorDialog, setColorDialog }: ThemingProps) {
  const { color, setColor } = useColor();

  return (
    <section className="relative py-24 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="max-w-3xl mb-6 flex flex-col ">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-5xl md:text-6xl text-white tracking-tight leading-[1.05]"
            >
              Theme As You Wish
            </motion.h2>

            <div className="mt-4 flex flex-col items-center">
              <div
                onClick={() => setColorDialog((v) => !v)}
                className="flex items-center gap-4 bg-white/5 py-2.5 px-5 rounded-2xl cursor-pointer transition-all group"
              >
                <span className="text-gray-300 text-sm select-none group-hover:text-white transition-colors">
                  Choose Accent Color
                </span>
                <div className="w-6 h-6 rounded-lg shadow-lg border bg-theme-accent border-white/20"></div>
              </div>
              {colorDialog &&
                createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setColorDialog(false)}
                    />
                    <div
                      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] p-4 bg-[#0a080b] border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HexColorPicker color={color} onChange={setColor} />
                      <button
                        onClick={() => setColorDialog(false)}
                        className="w-full mt-4 py-2 bg-white text-black rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </>,
                  document.body,
                )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative group"
          >
            <div className="relative flex items-center justify-center">
              <FullAppMock className="scale-[0.45] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.85] xl:scale-[1] origin-center" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
