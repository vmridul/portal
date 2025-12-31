"use client";
import Room from "@/components/room";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ room_id: string }>;
}) {
  const { room_id } = use(params);
  const router = useRouter();
  useEffect(() => {
    const checkMembership = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/`);
        return;
      }
      const { data, error } = await supabase
        .from("RoomMembers")
        .select("*")
        .eq("room_id", room_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        router.push(`/home?join=${room_id}`);
      }
    };
    checkMembership();
  }, [room_id, router]);

  return (
    <Suspense fallback={null}>
      <Room room_id={room_id} />
    </Suspense>
  );
}
