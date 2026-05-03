"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Attachment01Icon,
  ArrowRight01Icon,
  SmileIcon,
} from "@hugeicons/core-free-icons";

export const ChatInputBarMock = ({
  className,
  bg,
  text,
}: {
  className?: string;
  bg?: string;
  text?: string;
}) => (
  <div
    className={`flex flex-col z-[99] md:w-[50%] md:min-w-[400px] w-[95%] relative md:px-3 px-2 py-1 md:py-3 rounded-xl bg-theme-surface border border-theme-border transition-all duration-300 ease-in-out ${className}`}
  >
    <div className="flex flex-col gap-2">
      <div className="text-start text-gray-400 w-full rounded-[8px] text-sm bg-transparent py-[10px] md:py-2 px-3 placeholder-[#58565f] resize-none cursor-text">
        Press / to focus
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="border border-theme-border py-2 px-2 rounded-[12px] text-white hover:bg-theme-border cursor-default">
            <HugeiconsIcon
              icon={Attachment01Icon}
              className="text-gray-400 w-4 h-4"
            />
          </div>
          <div className="border border-theme-border py-2 px-2 rounded-[12px] text-white hover:bg-theme-border cursor-default">
            <HugeiconsIcon icon={SmileIcon} className="text-gray-400 w-4 h-4" />
          </div>
        </div>
        <div
          className={`py-3 px-3 rounded-[12px] text-black cursor-default ${bg} ${text}`}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3" />
        </div>
      </div>
    </div>
  </div>
);
