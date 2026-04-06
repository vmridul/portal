import Image from "next/image";
import { usePresence } from "@/contexts/presenceContext";
import { Moon, Search, UserPlus } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { timeAgo } from "@/app/actions/timeAgo";
import { Skeleton } from "./skeleton";
import { useState, useEffect } from "react";
import { useColor } from "@/contexts/colorContext";

export default function FriendsList({ friends }: { friends: any[] }) {
  const { onlineUsers, awayUsers } = usePresence();
  const {
    setActiveFriendPage,
    addFriendDialog,
    setAddFriendDialog,
    setPendingRequestMenu,
  } = useUIStore();
  const [search, setSearch] = useState("");
  const { color, textColor } = useColor();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredFriends = friends.filter((friend) => {
    return friend?.friend?.username
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <>
      {!friends || !filteredFriends ? (
        <Skeleton className="h-screen mt-2 w-full" />
      ) : (
        <div className="h-screen">
          <div className="flex mt-3 ml-3 mr-3 gap-2 items-center justify-between">
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
              className=" flex text-sm px-3 items-center text-white/60 rounded-[6px] bg-theme-hover"
            >
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search friend"
                onChange={(e) => setSearch(e.target.value)}
                className="px-2 py-1 w-[165px] md:w-72 bg-transparent outline-none placeholder-white/40"
              />
            </div>
            <button
              onClick={(e) => {
                setAddFriendDialog(!addFriendDialog);
              }}
              style={{ backgroundColor: color, color: textColor }}
              className="flex text-sm items-center gap-1 ease-in-out hover:brightness-110 hover:opacity-90 px-4 py-1 rounded-[8px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add friend</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3">
            {filteredFriends.length > 0 &&
              filteredFriends.map((friend) => {
                const isUserOnline = onlineUsers.has(friend?.friend?.user_id);
                const isUserAway = awayUsers.has(friend?.friend?.user_id);
                const unreadCount = friend?.unread_count || 0;
                return (
                  <div
                    className="group h-[70px] bg-theme-hover hover:bg-theme-hover/80 transition-all duration-100 ease-in-out rounded-[8px] gap-3 flex items-center px-3 p-2 cursor-pointer"
                    key={friend.id}
                    onClick={() => {
                      setActiveFriendPage(friend?.friend?.user_id);
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
                        {mounted && unreadCount > 0 && (
                          <div
                            className="w-4 h-4 rounded-full items-center justify-center flex flex-shrink-0 mr-1"
                            style={{ backgroundColor: color }}
                          >
                            <span className="text-[8px] font-medium text-white">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#aaaaaa] text-xs truncate w-[80px]">
                          {friend?.last_msg ? friend?.last_msg : ""}
                        </span>
                        <span className="text-[#aaaaaa] text-xs whitespace-nowrap mr-1">
                          {timeAgo(friend?.updated_at || friend?._creationTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
}
