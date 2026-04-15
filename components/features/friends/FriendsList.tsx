import Image from "next/image";
import { usePresence } from "@/contexts/presenceContext";
import { Moon, Search, UserPlus, Users } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { timeAgo } from "@/lib/utils/date";
import { useState, useEffect } from "react";
import { useColor } from "@/contexts/colorContext";
import type { UUID } from "crypto";

type FriendItem = {
  id: string;
  last_msg?: string;
  updated_at?: string | number;
  _creationTime?: number;
  unread_count?: number;
  friend?: {
    user_id?: string;
    username?: string;
    avatar?: string;
  } | null;
};

export default function FriendsList({
  friends,
  isLoading,
}: {
  friends: FriendItem[];
  isLoading: boolean;
}) {
  const { onlineUsers, awayUsers } = usePresence();
  const {
    setActiveFriendPage,
    setPendingRequestMenu,
    activeFriendPage,
    setModal
  } = useUIStore();
  const [search, setSearch] = useState("");
  const { color, textColor } = useColor();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredFriends = friends.filter((friend) => {
    return (friend?.friend?.username || "")
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <>
      <div className="h-screen flex flex-col">
        <div className="flex mt-3 ml-3 mr-3 gap-0 items-center justify-between">
          <div
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
              }
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className=" flex text-sm px-3 w-[50%] items-center text-white/60 rounded-[6px] bg-theme-hover"
          >
            <Search className="w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search friend"
              onChange={(e) => setSearch(e.target.value)}
              className="px-2 py-1 w-full bg-transparent outline-none placeholder-white/40"
            />
          </div>
          <button
            onClick={() => {
              setModal("ADD_FRIEND");
            }}
            style={{ backgroundColor: color, color: textColor }}
            className="flex text-sm items-center gap-1 ease-in-out hover:brightness-110 hover:opacity-90 px-4 py-1 rounded-[8px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add friend</span>
          </button>
        </div>
        <div className="flex-1 p-3">
          {filteredFriends.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredFriends.map((friend) => {
                const friendId = friend?.friend?.user_id || null;
                const isUserOnline = friendId
                  ? onlineUsers.has(friendId)
                  : false;
                const isUserAway = friendId ? awayUsers.has(friendId) : false;
                const unreadCount = friend?.unread_count || 0;
                const isActiveFriend = activeFriendPage === friendId;
                return (
                  <div
                    className="group h-[70px] bg-theme-border hover:bg-theme-hover transition-all duration-100 ease-in-out rounded-[8px] gap-3 flex items-center px-3 p-2 cursor-pointer"
                    key={friend.id}
                    onClick={() => {
                      if (!friendId) return;
                      setActiveFriendPage(friendId as UUID);
                      setPendingRequestMenu(false);
                    }}
                  >
                    <div className="relative">
                      <Image
                        src={
                          friend?.friend?.avatar || "/assets/default-avatar.png"
                        }
                        alt=""
                        width={12}
                        height={12}
                        unoptimized
                        className="w-10 h-10 rounded-[8px] border border-[#080f17]"
                      />
                      {isUserOnline ? (
                        <div className="absolute right-0 bottom-0 w-2 h-2 bg-green-500 border border-[#59ab44] rounded-full" />
                      ) : isUserAway ? (
                        <Moon
                          fill="yellow"
                          className="absolute text-yellow-400 right-0 bottom-0 w-[10px] h-[10px] opacity-90"
                        />
                      ) : (
                        <div className="absolute right-0 bottom-0 w-2 h-2 bg-gray-500 border border-[#858585] rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-white/90 text-sm truncate w-[80px]">
                          {friend?.friend?.username}
                        </span>
                        {mounted && unreadCount > 0 && !isActiveFriend && (
                          <div
                            className="w-4 h-4 rounded-full items-center justify-center flex flex-shrink-0 mr-1"
                            style={{ backgroundColor: color, color: textColor }}
                          >
                            <span className="text-[8px] font-medium">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#aaaaaa] text-xs truncate w-[80px]">
                          {friend?.last_msg ? friend?.last_msg : ""}
                        </span>
                        <span className="text-[#aaaaaa] text-xs whitespace-nowrap mr-2">
                          {timeAgo(friend?.updated_at || friend?._creationTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full mt-[30%] justify-center">
              <div className={`${isLoading ? "hidden" : "block"} rounded-[14px] text-center`}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[12px] border border-theme-border bg-theme-base">
                  <Users className="h-5 w-5 text-white/45" />
                </div>
                <p className="mt-4 text-sm text-white/40">No friends yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
