import { useUIStore } from "@/store/uiStore";
import { timeAgo } from "@/lib/utils/date";
import Image from "next/image";
import { Check, X } from "lucide-react";
import {
  useFriendActions,
  type PendingRequest,
  type SentRequest,
} from "@/hooks";
import { useColor } from "@/contexts/colorContext";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface PendingRequestMenuProps {
  pendingRequests: PendingRequest[];
  sentRequests: SentRequest[];
}

export default function PendingRequestMenu({
  pendingRequests,
  sentRequests,
}: PendingRequestMenuProps) {
  const { selectedPendingMenu, setSelectedPendingMenu, pendingRequestMenu } =
    useUIStore();
  const { color, textColor } = useColor();
  const { acceptRequest, rejectRequest } = useFriendActions();

  const handleAccept = async (req_id: string) => {
    try {
      await acceptRequest(req_id as Id<"friends">);
      toast.success("Friend request accepted");
    } catch (e) {
      toast.error((e as Error).message || "Failed to accept");
    }
  };

  const handleReject = async (req_id: string, showToast: boolean) => {
    try {
      await rejectRequest(req_id as Id<"friends">);
      if (showToast) toast.success("Friend request rejected");
    } catch (e) {
      if (showToast) toast.error((e as Error).message || "Failed to reject");
    }
  };

  return (
    <div
      className={`${
        pendingRequestMenu
          ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
          : "translate-y-1 scale-95 opacity-0 pointer-events-none"
      } duration-200 transition-all ease-in-out z-[9000] absolute p-2 rounded-[8px] h-[35%] min-w-[250px] top-10 right-4 bg-theme-base border border-theme-border`}
    >
      <div className="bg-theme-surface text-sm text-white h-9 rounded-[8px] w-fit p-1 flex items-center gap-1">
        <button
          onClick={() => setSelectedPendingMenu(true)}
          className={`px-3 py-1 rounded-[6px] ${selectedPendingMenu ? "bg-theme-hover" : "hover:bg-theme-hover"}`}
        >
          Received
        </button>
        <button
          onClick={() => setSelectedPendingMenu(false)}
          className={`px-3 py-1 rounded-[6px] ${!selectedPendingMenu ? "bg-theme-hover" : "hover:bg-theme-hover"}`}
        >
          Sent
        </button>
      </div>
      <div className="mt-2 flex flex-col gap-1 max-h-[200px] overflow-y-auto">
        {selectedPendingMenu ? (
          pendingRequests.length === 0 ? (
            <div className="text-white/40 text-xs p- mx-auto my-[30%]">
              No pending requests
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-2 p-2 rounded-[6px]"
              >
                <Image
                  src={request.sender?.avatar || "/assets/default-avatar.png"}
                  width={32}
                  height={32}
                  unoptimized
                  alt=""
                  className="w-8 h-8 rounded-[6px]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">
                    {request.sender?.username}
                  </div>
                  <div className="text-white/40 text-xs">
                    {timeAgo(request._creationTime)}
                  </div>
                </div>
                <button
                  onClick={() => handleAccept(request.id)}
                  className="p-1 rounded-[6px] hover:bg-theme-hover"
                >
                  <Check className="w-4 h-4 text-green-500" />
                </button>
                <button
                  onClick={() => handleReject(request.id, true)}
                  className="p-1 rounded-[6px] hover:bg-theme-hover"
                >
                  <X className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            ))
          )
        ) : sentRequests.length === 0 ? (
          <div className="text-white/40 text-xs p-2 mx-auto my-[30%]">
            No sent requests
          </div>
        ) : (
          sentRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center gap-2 p-2 rounded-[6px]"
            >
              <Image
                src={request.receiver?.avatar || "/assets/default-avatar.png"}
                width={32}
                height={32}
                unoptimized
                alt=""
                className="w-8 h-8 rounded-[6px]"
              />
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-sm text-white/90 truncate max-w-[120px]">
                  {request.receiver?.username}
                </span>
                <span className="text-xs text-white/60">
                  {timeAgo(request._creationTime)}
                </span>
              </div>
              <div className="flex gap-1">
                <div
                  onClick={() => handleReject(request.id, false)}
                  className="cursor-pointer"
                >
                  <X className="text-gray-300 hover:bg-theme-hover p-1 rounded-[8px]" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
