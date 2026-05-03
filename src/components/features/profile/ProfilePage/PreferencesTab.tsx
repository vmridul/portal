import { useColor } from "@/contexts/colorContext";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { createPortal } from "react-dom";

export const PreferencesTab = () => {
  const { color, setColor, textColor } = useColor();
  const [colorDialog, setColorDialog] = useState(false);
  return (
    <div className="flex flex-col items-center pt-2 md:pt-10 w-[80%] md:w-[47%] mx-auto pb-10">
      <div className="w-full relative flex flex-col gap-3 mt-5">
        <span className="text-xs text-gray-400 font-medium">Accent Color</span>
        <div
          onClick={() => setColorDialog((v) => !v)}
          className="flex items-center justify-between bg-theme-hover py-2.5 px-5 rounded-xl cursor-pointer transition-all group"
        >
          <span className="text-gray-200 text-sm select-none group-hover:text-white transition-colors">
            Open Color Picker
          </span>
          <div
            style={{ backgroundColor: color }}
            className="w-6 h-6 rounded-lg shadow-lg border border-white/20"
          ></div>
        </div>
      </div>
      {colorDialog &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998] min-w-32"
              onClick={() => setColorDialog(false)}
            />
            <div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] p-4 bg-theme-base border border-theme-border rounded-3xl animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 px-1">
                <h3 className="text-white text-md">Pick Accent Color</h3>
              </div>
              <HexColorPicker color={color} onChange={setColor} />
              <button
                onClick={() => setColorDialog(false)}
                style={{ color: textColor }}
                className="w-full mt-6 py-2.5 bg-theme-accent rounded-xl text-sm transition-all"
              >
                Done
              </button>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};
