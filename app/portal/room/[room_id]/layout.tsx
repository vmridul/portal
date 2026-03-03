"use client";
import RightSidebar from "@/components/ui/rightSidebar";
import TopBar from "@/components/ui/topBar";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import React from "react";
import LeftSidebar from "@/components/ui/leftSidebar";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const room_id = params.room_id as string;

  return (
    <section className="flex">
      <div className="flex-1 flex">
        <LeftSidebar className="w-64" />
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
