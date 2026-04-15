"use client";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/layout/TopBar";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import React from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const room_id = params.room_id as string;

  return (
    <section className="flex h-screen overflow-hidden">
      <div className="flex-1 flex">
        <LeftSidebar className="w-64" showPortalSkeletons={false} />
        <div className="flex flex-col w-full">
          <TopBar room_id={room_id} />
          {children}
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
