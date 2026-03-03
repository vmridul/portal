"use client";
import Room from "@/components/room";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ room_id: string }>;
}) {
  const { room_id } = use(params);
  const router = useRouter();
  const members = useQuery(api.roomQueries.getRoomMembers, { room_id });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace(`/`);
        return;
      }

      if (members !== undefined) {
        const isMember = members.some((m: any) => m.user_id === user.uid);
        if (!isMember) {
          router.replace('/portal');
        } else {
          setChecking(false);
        }
      }
    });

    return () => unsubscribe();
  }, [room_id, router, members]);

  if (checking) return null;

  return (
    <Suspense fallback={null}>
      <Room room_id={room_id} />
    </Suspense>
  );
}
