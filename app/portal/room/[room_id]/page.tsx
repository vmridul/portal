"use client";
import Room from "@/components/features/rooms/Room";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRoomMembers } from "@/hooks";
import { use } from "react";
import { ChatSkeleton } from "@/components/shared/skeletons/ChatSkeleton";

export default function Page({
  params,
}: {
  params: Promise<{ room_id: string }>;
}) {
  const { room_id } = use(params);
  const router = useRouter();
  const members = useRoomMembers(room_id);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace(`/`);
        return;
      }

      if (members !== undefined) {
        const isMember = members.some((m: { user_id: string }) => m.user_id === user.uid);
        if (!isMember) {
          router.replace('/portal');
        } else {
          setChecking(false);
        }
      }
    });

    return () => unsubscribe();
  }, [room_id, router, members]);

  if (checking) return <ChatSkeleton />;

  return (
    <Suspense fallback={null}>
      <Room room_id={room_id} />
    </Suspense>
  );
}
