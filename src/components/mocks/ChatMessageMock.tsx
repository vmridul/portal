"use client";

import Image from "next/image";

export const ChatMessageMock = ({ 
  name = "Sam", 
  avatar = "/assets/ch.png", 
  className,
  showDate = true
}: { 
  name?: string; 
  avatar?: string; 
  className?: string;
  showDate?: boolean;
}) => (
  <div className={`w-full overflow-hidden pb-4 text-left ${className}`}>
    {showDate && (
      <div className="flex items-center justify-center py-4 px-4 md:px-10">
        <span className="px-4 py-1 rounded-full bg-theme-border text-xs text-gray-300">
          26 April 2026
        </span>
      </div>
    )}

    {/* Message 1 */}
    <div className="px-4 md:px-10 py-1 transition-colors hover:bg-theme-border duration-200">
      <div className="flex gap-2">
        <Image src={avatar} width={40} height={40} alt="" className="w-10 h-10 rounded-[12px] flex-shrink-0" />
        <div className="flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-400">{name}</span>
            <span className="text-[10px] text-gray-500">10:00 AM</span>
          </div>
          <div className="text-sm text-white mt-0.5">Hey! Have you seen the new design?</div>
        </div>
      </div>
    </div>

    {/* Message 2 (Continuation) */}
    <div className="px-4 md:px-10 py-0.5 transition-colors hover:bg-theme-border duration-200">
      <div className="flex gap-2">
        <div className="w-10 flex-shrink-0" />
        <div className="text-sm text-white">It looks absolutely stunning ✨</div>
      </div>
    </div>

    {/* Message 3 (User) */}
    <div className="px-4 md:px-10 py-2 transition-colors hover:bg-theme-border duration-200 mt-2">
      <div className="flex gap-2">
        <Image src="/assets/sq.png" width={40} height={40} alt="" className="w-10 h-10 rounded-[12px] flex-shrink-0" />
        <div className="flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-400">mridul</span>
            <span className="text-[10px] text-gray-500">10:01 AM</span>
          </div>
          <div className="text-sm text-white mt-0.5">Yeah, just checked it out. The animations are so smooth! 🚀</div>
        </div>
      </div>
    </div>
  </div>
);
