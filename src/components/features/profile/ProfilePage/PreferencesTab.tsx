import { useColor } from "@/contexts/colorContext";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { createPortal } from "react-dom";

export const PreferencesTab = () => {
  const { color, setColor } = useColor();
  const [colorDialog, setColorDialog] = useState(false);
  return (
    <div className="flex flex-col items-center pt-2 md:pt-10 w-[80%] md:w-[47%] mx-auto pb-10">
      <div className="w-full relative flex flex-col gap-1 mt-5">
        <span className="text-xs text-gray-300">Theme</span>
        <div
          onClick={() => setColorDialog((v) => !v)}
          className="flex items-center justify-between bg-theme-hover py-2 px-3 rounded-[8px] cursor-pointer"
        >
          <span className="text-gray-300 text-sm select-none hover:text-gray-200">
            Click to open color picker
          </span>
          <div
            style={{ backgroundColor: color }}
            className="w-7 h-7 rounded-[8px]"
          ></div>
        </div>
      </div>
      {colorDialog &&
        createPortal(
          <div
            className="absolute md:scale-100 scale-[80%] top-8 md:top-44 right-0 md:right-64 z-[9999]"
            onClick={(e) => e.stopPropagation()}
          >
            <HexColorPicker color={color} onChange={setColor} />
          </div>,
          document.body,
        )}
    </div>
  );
};
