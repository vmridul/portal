"use client";

import Image from "next/image";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { HugeiconsIcon } from "@hugeicons/react";
import { Users } from "@hugeicons/core-free-icons";

export const RoomMembersMock = ({ className }: { className?: string }) => (
  <div
    className={`p-3 bg-[#101010] border border-[#242424] rounded-[12px] shadow-2xl backdrop-blur-md ${className || "w-56"}`}
  >
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center w-full justify-between">
        <span className="text-xs text-[#aaaaaa] font-medium">Members</span>
        <div className="bg-[#272727] flex items-center px-2 py-1 rounded-[8px] text-[10px] text-gray-300">
          <HugeiconsIcon icon={Users} className="w-3 h-3" />
          <span className="ml-1">2</span>
        </div>
      </div>
    </div>
    <div className="space-y-1">
      {[
        { name: "sq", img: "/assets/sq.png" },
        { name: "ch", img: "/assets/ch.png" },
      ].map((user, i) => (
        <div
          key={i}
          className="flex gap-4 items-center p-1 px-2 -ml-2 rounded-lg"
        >
          <div className="relative">
            <Image
              src={user.img}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-[12px]"
            />
            <StatusIndicator isOnline={i !== 2} isAway={i === 2} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm text-white/90 font-medium">
              {user.name}
            </span>
            <span className="text-[10px] text-[#aaaaaa] font-extralight">
              {i === 0 ? "Owner" : "Member"}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
