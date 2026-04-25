"use client";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/layout/TopBar";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import React from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";

import { useUIStore } from "@/store/uiStore";
import { DetailsSidebar } from "@/components/features/rooms/sidebar/DetailsSidebar";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const room_id = params.room_id as string;
  const { isSidebarOpen } = useUIStore();

  return (
    <section className="flex h-screen overflow-hidden">
      <div className="flex-1 flex">
        <LeftSidebar
          className="w-64 flex-shrink-0"
          showPortalSkeletons={false}
        />
        <div className="flex flex-col flex-1 min-w-0 bg-theme-base overflow-hidden relative">
          <TopBar room_id={room_id} />
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-hidden relative">{children}</div>
            {isSidebarOpen && <DetailsSidebar id={room_id} type="room" />}
          </div>
        </div>
        <RightSidebar room_id={room_id} />
      </div>
    </section>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
