import {
  Users,
  Clock,
  ArrowLeft,
  Ellipsis,
  UserX,
  Moon,
  PaintRoller,
  Image as ImageIcon,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import AddFriendDialog from "../components/ui/addFriendDialog";
import PendingRequestMenu from "../components/ui/pendingRequestMenu";
import ActiveFriendPage from "./ui/activeFriendPage";
import FriendsList from "./ui/friendsList";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "./ui/skeleton";
import { usePresence } from "@/contexts/presenceContext";
import { useState, useEffect } from "react";
import { useColor } from "@/contexts/colorContext";
import { HexColorPicker } from "react-colorful";
import { createPortal } from "react-dom";
import { MediaDialog } from "./ui/mediaDialog";

export default function FriendsTab() {
  const {
    addFriendDialog,
    setAddFriendDialog,
    pendingRequestMenu,
    setPendingRequestMenu,
    activeFriendPage,
    setActiveFriendPage,
    menuOpen,
    setMenuOpen,
  } = useUIStore();
  const user = useUserStore((s) => s.user);
  const { onlineUsers, awayUsers } = usePresence();

  const friendsQuery = useQuery(
    api.friends.getFriends,
    user?.user_id ? {} : "skip",
  );
  const pendingRequestsQuery = useQuery(
    api.friends.getPendingRequests,
    user?.user_id ? {} : "skip",
  );
  const sentRequestsQuery = useQuery(
    api.friends.getSentRequests,
    user?.user_id ? {} : "skip",
  );
  const friends = friendsQuery ?? [];
  const pendingRequests = pendingRequestsQuery ?? [];
  const sentRequests = sentRequestsQuery ?? [];
  const isLoadingFriendsData =
    !user?.user_id ||
    friendsQuery === undefined ||
    pendingRequestsQuery === undefined ||
    sentRequestsQuery === undefined;
  const friend = friends.find(
    (friend) => friend?.friend?.user_id === activeFriendPage,
  );

  const removeFriendMutation = useMutation(api.friends.removeFriend);

  const { color, setColor } = useColor();
  const [colorDialog, setColorDialog] = useState(false);
  const [mediaDialog, setMediaDialog] = useState(false);

  useEffect(() => {
    const close = () => {
      setColorDialog(false);
    };
    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  return (
    <>
      {addFriendDialog && (
        <AddFriendDialog
          setAddFriendDialog={setAddFriendDialog}
          user_id={user?.user_id!}
        />
      )}

      <div
        className={`
    fixed z-[9999] md:right-[224px] right-4 md:top-[16px] top-[35px] text-white/90 font-sans flex flex-col overflow-hidden items-start
    max-w-[140px]
    h-auto
    rounded-[8px] bg-theme-surface border border-theme-border
    shadow-lg text-xs
    transform transition-all duration-150
 ease-out
    ${
      menuOpen
        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
        : "opacity-0 scale-95 translate-y-1 pointer-events-none"
    }
  `}
      >
        <div
          onClick={async (e) => {
            if (activeFriendPage) {
              await removeFriendMutation({ friend_id: activeFriendPage });
            }
            setActiveFriendPage(null);
            setMenuOpen(false);
          }}
          className="flex items-center cursor-pointer hover:bg-theme-hover text-red-200"
        >
          <UserX className="w-4 h-4 ml-3 mr-2" />
          <button className="w-32 text-start py-2">Remove Friend</button>
        </div>
      </div>
      <div className="relative flex-1 font-sans">
        {activeFriendPage ? (
          <div
            className={`
 flex items-center p-3  w-full gap-4 border-b border-theme-border bg-theme-hover bg-opacity-100`}
          >
            <ArrowLeft
              onClick={() => {
                setActiveFriendPage(null);
                setMenuOpen(false);
              }}
              className="w-7 h-7 hover:bg-theme-base cursor-pointer duration-100 transition-all ease-in-out rounded-[8px] p-1 text-white/70"
            />
            <div className="relative flex flex-1 items-center gap-3">
              <Image
                src={friend?.friend?.avatar || "@/assets/default-avatar.png"}
                alt="pic"
                width={6}
                height={6}
                unoptimized
                className="w-7 h-7 rounded-[8px]"
              />
              {onlineUsers.has(friend?.friend?.user_id!) ? (
                <div className="absolute bottom-0 left-5 h-2 w-2 bg-green-500 border border-[#59ab44] rounded-full"></div>
              ) : awayUsers.has(friend?.friend?.user_id!) ? (
                <Moon
                  fill="yellow"
                  className="absolute text-yellow-400 left-5 bottom-0 w-[10px] h-[10px] opacity-90"
                />
              ) : (
                <div className="absolute bottom-0 left-5 h-2 w-2 bg-gray-500 border border-[#858585] rounded-full"></div>
              )}
              <span className="text-white/80 text-sm">
                {friend?.friend?.username}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setColorDialog((v) => !v);
                }}
                className="w-7 select-none h-7 cursor-pointer rounded-[8px] p-1 flex items-center justify-center hover:bg-theme-base duration-100 transition-all ease-in-out"
              >
                <PaintRoller className="w-4 h-4 text-white/70" />
              </div>
              {colorDialog &&
                createPortal(
                  <div
                    className="absolute md:scale-100 scale-[80%] top-8 md:top-12 right-0 md:right-[290px] z-[9999]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HexColorPicker color={color} onChange={setColor} />
                  </div>,
                  document.body,
                )}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setMediaDialog(true);
                }}
                className="w-7 select-none h-7 cursor-pointer duration-100 transition-all ease-in-out rounded-[8px] p-1 flex items-center justify-center hover:bg-theme-base"
              >
                <ImageIcon className="w-4 h-4 text-white/70" />
              </div>
              {mediaDialog && activeFriendPage && (
                <MediaDialog
                  room_id={activeFriendPage}
                  type="friend"
                  setMediaDialog={setMediaDialog}
                />
              )}
              <div
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center"
              >
                <Ellipsis className="w-7 h-7 hover:bg-theme-base cursor-pointer duration-100 transition-all ease-in-out rounded-[8px] p-1 text-white/70" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between md:px-2 px-7 items-center bg-theme-base border-b border-theme-border py-1 h-12">
            <div className="ml-3 md:flex hidden items-center gap-2 text-white/90">
              <Users className="w-4 h-4" />
              <h1 className="text-md">Friends</h1>
            </div>
            <div className="ml-3 md:hidden flex items-center gap-2 text-white/90">
              <h1 className="text-md font-semibold">Portal</h1>
            </div>
            <div className="flex items-center text-sm gap-1">
              <button
                onClick={(e) => {
                  setPendingRequestMenu(!pendingRequestMenu);
                }}
                className={`relative select-none p-2 cursor-pointer md:pr-2 pr-4 rounded-xl flex items-center justify-center hover:bg-theme-hover`}
              >
                <Clock className="w-4 h-4" />
                <div
                  className={`${
                    pendingRequests.length > 0 ? "block" : "hidden"
                  } w-2 h-2 bg-red-600 rounded-full absolute top-1 right-2
                  `}
                ></div>
              </button>
            </div>
          </div>
        )}

        <PendingRequestMenu
          pendingRequests={pendingRequests}
          sentRequests={sentRequests}
        />

        {/* friends list */}
        {activeFriendPage ? (
          <ActiveFriendPage />
        ) : (
          <FriendsList friends={friends} isLoading={isLoadingFriendsData} />
        )}
      </div>
    </>
  );
}
