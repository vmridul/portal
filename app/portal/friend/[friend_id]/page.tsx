"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import LeftSidebar from "@/components/shared/layout/LeftSidebar";
import NotificationTab from "@/components/features/notifications/NotificationTab";
import { useFriends } from "@/hooks";
import { FriendChatContent } from "@/components/features/friends/FriendChatContent";

function FriendPageContent() {
  const params = useParams();
  const router = useRouter();
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const [checking, setChecking] = useState(true);

  const { friends, isLoading: isLoadingFriends } = useFriends();

  const friendId = params.friend_id as string;
  const friend = friends.find((f) => f?.friend?.user_id === friendId);
  const isFriend = !!friend;

  useEffect(() => {
    if (!isAuthLoaded) return;

    if (!userId) {
      router.replace(`/`);
      return;
    }

    if (friendId && friendId.length > 0) {
      if (isLoadingFriends) return;

      if (!isFriend) {
        router.replace("/portal");
        return;
      }
      setChecking(false);
    } else {
      router.replace("/portal");
    }
  }, [friendId, router, userId, isAuthLoaded, isFriend, isLoadingFriends]);

  if (checking) return null;

  return (
    <div className="flex h-[100dvh] overflow-hidden text-white">
      <LeftSidebar className="w-64" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <FriendChatContent />
      </div>
      <NotificationTab />
    </div>
  );
}

export default function Page() {
  return <FriendPageContent />;
}
