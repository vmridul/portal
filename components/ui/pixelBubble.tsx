import React from "react";
import { pixelFont } from "@/app/page";

interface PixelSpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  tailPosition?: "left" | "right" | "center";
}

export const PixelSpeechBubble: React.FC<PixelSpeechBubbleProps> = ({
  children,
  className = "",
  tailPosition = "right",
}) => {
  const tailPositionClass = {
    left: "left-8",
    right: "right-8",
    center: "left-1/2 -translate-x-1/2",
  }[tailPosition];

  return (
    <div
      className={`${pixelFont.variable} relative inline-block bg-white border-4 border-black rounded-[8px] px-32 py-3 ${className}`}
    >
      {/* Top border */}
      <div className="absolute top-0 left-2 right-2 h-0.5 bg-opacity-50 bg-black"></div>

      {/* Top corners */}
      <div className="absolute top-1 left-1 w-1 h-1 bg-black"></div>
      <div className="absolute top-1 right-1 w-1 h-1 bg-black"></div>

      {/* Side borders */}
      <div className="absolute top-2 bottom-2 bg-opacity-50 left-0 w-0.5 bg-black"></div>
      <div className="absolute top-2 bottom-2 bg-opacity-50 right-0 w-0.5 bg-black"></div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-2 bg-opacity-50 right-2 h-0.5 bg-black"></div>

      {/* Bottom corners */}
      <div className="absolute bottom-1 left-1 w-1 h-1 bg-black"></div>
      <div className="absolute bottom-1 right-1 w-1 h-1 bg-black"></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Pixelated tail */}
      <div className={`absolute -bottom-2 ${tailPositionClass}`}>
        <div className="w-4 h-2 bg-white border-l-4 border-r-4 border-black"></div>
        <div className="w-2 h-2 bg-white border-b-4 border-r-4 border-black ml-auto"></div>
      </div>
    </div>
  );
};
