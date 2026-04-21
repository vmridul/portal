"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SidebarLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarLayout({ children, className }: SidebarLayoutProps) {
  return (
    <div className={cn("w-[320px] h-full min-h-0 bg-theme-base border-l border-theme-border flex flex-col", className)}>
      {children}
    </div>
  );
}

export { SidebarHeader } from "./SidebarHeader";
export { SidebarFooter } from "./SidebarFooter";