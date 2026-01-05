import { useRoomInfo } from "@/hooks/useRooomInfo";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EllipsisIcon, Clipboard, UserX } from "lucide-react";
import { LeaveDialog } from "./leaveDialog";
import { createPortal } from "react-dom";

export function RoomItem({
  room,
  router,
  setMobileMenu,
  currentRoom,
  user,
}: any) {
  const { owner_id } = useRoomInfo(room?.Rooms?.room_id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const close = () => {
      setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => {
      document.removeEventListener("click", close);
    };
  }, [menuOpen]);

  return (
    <>
      {leaveDialog && (
        <LeaveDialog
          owner_id={owner_id}
          user={user}
          roomName={room?.Rooms?.room_name}
          room_id={room?.Rooms?.room_id}
          setLeaveDialog={setLeaveDialog}
          router={router}
        />
      )}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setMobileMenu?.(false);
          router.push(`/portal/room/${room?.Rooms?.room_id}`);
        }}
        className={`cursor-pointer group relative flex items-center gap-3 mt-2 rounded-[8px] py-2 px-2 hover:bg-[#211f31] ${currentRoom?.toString() === room?.Rooms?.room_id.toString() &&
          "bg-[#211f31]"
          }`}
        key={room?.Rooms?.room_id}
      >
        <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white opacity-90 w-10 h-10">
          {room?.Rooms?.room_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col rounded-[8px] cursor-pointer">
          {room?.Rooms?.room_name}
          <span className="text-white/40 text-xs">
            ID: {room?.Rooms?.room_id}
          </span>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setMenuPos({ x: e.clientX, y: e.clientY });
            setMenuOpen(!menuOpen);
          }}
          className="absolute right-4 transition-all duration-100 opacity-0 group-hover:opacity-100 text-white/70"
        >
          <EllipsisIcon className="w-4 h-4 hover:text-white/90" />
        </div>
        {menuOpen &&
          createPortal(
            <div
              style={{
                top: menuPos.y,
                left: menuPos.x + 14,
              }}
              className={`
    fixed z-[9999] text-white/90 font-sans flex flex-col overflow-hidden items-start
    max-w-[150px]
    rounded-[8px] bg-[#0f1320] border border-[#3a3a3a]
    shadow-lg text-xs
    transform transition-all duration-150 select-none
 ease-out
    ${menuOpen
                  ? "scale-100 translate-y-0 pointer-events-auto"
                  : "scale-95 translate-y-1 pointer-events-none"
                }
  `}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(room?.Rooms?.room_id);
                  toast.success("Room ID copied to clipboard");
                  setMenuOpen(false);
                }}
                className="border-b cursor-pointer border-[#3a3a3a] flex items-center hover:bg-[#222636]"
              >
                <Clipboard className="w-4 h-4 ml-3 mr-2 text-white/90" />
                <button className=" w-32 text-start py-3">Copy Room ID</button>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setLeaveDialog(true);
                  setMenuOpen(false);
                }}
                className="flex items-center cursor-pointer hover:bg-[#302727] text-red-200"
              >
                <UserX className="w-4 h-4 ml-3 mr-2" />
                <button className="w-32 text-start py-3">{`${owner_id == user?.user_id ? "Delete Room" : "Leave Room"
                  }`}</button>
              </div>
            </div>,
            document.body
          )}
      </div>
    </>
  );
}
