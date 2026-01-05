import { Users, Clock, ArrowLeft, Ellipsis, UserX, Moon } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import AddFriendDialog from "../components/ui/addFriendDialog";
import PendingRequestMenu from "../components/ui/pendingRequestMenu";
import ActiveFriendPage from "./ui/activeFriendPage";
import FriendsList from "./ui/friendsList";
import { useUserStore } from "@/store/useUserStore";
import { useFriends } from "@/hooks/useFriends";
import Image from "next/image";
import { removeFriend } from "@/app/actions/removeFriend";
import { Skeleton } from "./ui/skeleton";
import { usePresence } from "@/contexts/presenceContext";

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
  const {
    friends,
    pendingRequests,
    sentRequests,
    setPendingRequests,
    setSentRequests,
  } = useFriends(user?.user_id!);
  const friend = friends.find(
    (friend) => friend?.friend?.user_id === activeFriendPage
  );

  //   useEffect(() => {
  //     const close = () => {
  //       setPendingRequestMenu(false);
  //     };
  //     document.addEventListener("click", close);
  //     return () => {
  //       document.removeEventListener("click", close);
  //     };
  //   }, []);

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
    fixed z-[9999] right-[224px] top-[16px] text-white/90 font-sans flex flex-col overflow-hidden items-start
    max-w-[140px]
    h-screen
    rounded-[8px] bg-[#0f1320] border border-[#3a3a3a]
    shadow-lg text-xs
    transform transition-all duration-150
 ease-out
    ${menuOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-1 pointer-events-none"
          }
  `}
      >
        <div
          onClick={(e) => {
            removeFriend(activeFriendPage, user?.user_id!);
            setActiveFriendPage(null);
            setMenuOpen(false);
          }}
          className="flex items-center cursor-pointer hover:bg-[#302727] text-red-200"
        >
          <UserX className="w-4 h-4 ml-3 mr-2" />
          <button className="w-32 text-start py-2">Remove Friend</button>
        </div>
      </div>
      <div className="relative flex-1 font-sans">
        {!friends || !user ? (
          <Skeleton className="h-[45px] w-full" />
        ) : activeFriendPage ? (
          <div
            className={`
 flex items-center py-3 pr-5 md:p-3  w-full gap-4 border-b border-[#322b45] bg-[#211f31] bg-opacity-100`}
          >
            <ArrowLeft
              onClick={() => {
                setActiveFriendPage(null);
                setMenuOpen(false);
              }}
              className="w-7 h-7 hover:bg-[#080f17] cursor-pointer duration-100 transition-all ease-in-out rounded-[8px] p-1 text-white/70"
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
            <div
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center"
            >
              <Ellipsis className="w-7 h-7 hover:bg-[#080f17] cursor-pointer duration-100 transition-all ease-in-out rounded-[8px] p-1 text-white/70" />
            </div>
          </div>
        ) : (
          <div className="flex justify-between md:px-2 px-7 items-center bg-[#080f17] border-b border-[#322b45] py-1 md:py-2">
            <div className="ml-3 md:flex hidden items-center gap-2 text-white/90">
              <Users className="w-4 h-4" />
              <h1 className="text-md">Friends</h1>
            </div>
            <div className="ml-3 md:hidden flex items-center gap-2 text-white/90">
              <h1 className="text-md font-semibold mt-1">Portal</h1>
            </div>
            <div className="flex items-center text-sm gap-1">
              <button
                onClick={(e) => {
                  setPendingRequestMenu(!pendingRequestMenu);
                }}
                className={`relative flex items-center gap-2 h-[28px] md:hover:bg-[#211f31] text-white/90 px-3 py-1 rounded-[8px]`}
              >
                <Clock className="w-4 h-4" />
                <div
                  className={`${pendingRequests.length > 0 ? "block" : "hidden"
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
          setPendingRequests={setPendingRequests}
          setSentRequests={setSentRequests}
        />

        {/* friends list */}
        {activeFriendPage ? (
          <ActiveFriendPage />
        ) : (
          <FriendsList friends={friends} />
        )}
      </div>
    </>
  );
}
