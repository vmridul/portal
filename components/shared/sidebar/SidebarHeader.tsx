"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface SidebarHeaderProps {
  title: string;
  onClose: () => void;
}

export function SidebarHeader({ title, onClose }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b border-theme-border">
      <span className="text-sm text-gray-200 px-2">
        {title}
      </span>
      <button
        onClick={onClose}
        className="p-2 hover:bg-theme-hover rounded-xl text-gray-400 hover:text-white transition-colors"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
      </button>
    </div>
  );
}
