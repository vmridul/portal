import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { useUIStore } from "@/store/uiStore";

import PendingRequestMenu from "@/components/features/friends/PendingRequestMenu";
import FriendsList from "@/components/features/friends/FriendsList";
import { useFriends } from "@/hooks";


export default function FriendsTab() {
  const {
    pendingRequestMenu,
    setPendingRequestMenu,
  } = useUIStore();
  const { friends, pendingRequests, sentRequests, isLoading: isLoadingFriendsData } = useFriends();

  return (
    <>
      <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden font-sans">
        <div className="flex justify-between md:px-2 px-7 items-center bg-theme-surface border-b border-theme-border py-1 h-12">
          <div className="ml-3 md:flex hidden items-center gap-2 text-white/90">
            <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
            <h1 className="text-md">Friends</h1>
          </div>
          <div className="ml-3 md:hidden flex items-center gap-2 text-white/90">
            <h1 className="text-md font-semibold">Portal</h1>
          </div>
          <div className="flex items-center text-sm gap-1">
            <button
              onClick={() => {
                setPendingRequestMenu(!pendingRequestMenu);
              }}
              className={`relative select-none p-2 cursor-pointer md:pr-2 pr-4 rounded-xl flex items-center justify-center hover:bg-theme-hover`}
            >
              <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4" />
              <div
                className={`${pendingRequests.length > 0 ? "block" : "hidden"
                  } w-2 h-2 bg-red-600 rounded-full absolute top-1 right-2
                `}
              ></div>
            </button>
          </div>
        </div>

        <PendingRequestMenu
          pendingRequests={pendingRequests}
          sentRequests={sentRequests}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">
            <FriendsList friends={friends} isLoading={isLoadingFriendsData} />
          </div>
        </div>
      </div>
    </>
  );
}