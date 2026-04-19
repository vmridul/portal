"use client";

import { X } from "@phosphor-icons/react";

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
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
