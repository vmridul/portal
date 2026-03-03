import { useUIStore } from "@/store/uiStore";
import { timeAgo } from "@/app/actions/timeAgo";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useColor } from "@/contexts/colorContext";
import { toast } from "sonner";

export default function PendingRequestMenu({
  pendingRequests,
  sentRequests,
}: {
  pendingRequests: any[];
  sentRequests: any[];
}) {
  const { selectedPendingMenu, setSelectedPendingMenu, pendingRequestMenu } =
    useUIStore();
  const { color, textColor } = useColor();

  const acceptRequest = useMutation(api.friends.acceptRequest);
  const rejectRequest = useMutation(api.friends.rejectRequest);

  const handleAccept = async (req_id: string) => {
    try {
      await acceptRequest({ requestId: req_id as any });
      toast.success("Friend request accepted");
    } catch (e: any) {
      toast.error(e.message || "Failed to accept");
    }
  };

  const handleReject = async (req_id: string, showToast: boolean) => {
    try {
      await rejectRequest({ requestId: req_id as any });
      if (showToast) toast.success("Friend request rejected");
    } catch (e: any) {
      if (showToast) toast.error(e.message || "Failed to reject");
    }
  };

  return (
    <div
      className={`${pendingRequestMenu
        ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
        : "translate-y-1 scale-95 opacity-0 pointer-events-none"
        } duration-200 transition-all ease-in-out z-[9000] absolute p-2 rounded-[8px] top-10 right-4 bg-theme-base border border-theme-border`}
    >
      <div className="bg-theme-surface text-sm text-white h-9 rounded-[8px] w-fit p-1 flex items-center gap-1">
        <button
          className={`border ${!selectedPendingMenu ? "text-white/70 border-opacity-0" : ""} border-theme-border p-1 px-3 rounded-[10px] transition-colors duration-100 ease-in-out`}
          style={selectedPendingMenu ? { backgroundColor: color, color: textColor } : {}}
          onClick={() => setSelectedPendingMenu(true)}
        >
          Pending {pendingRequests.length === 0 ? "" : pendingRequests.length}
        </button>
        <button
          className={`border ${selectedPendingMenu ? "text-white/70 border-opacity-0" : ""} border-theme-border p-1 px-3 rounded-[10px] transition-colors duration-100 ease-in-out`}
          style={!selectedPendingMenu ? { backgroundColor: color, color: textColor } : {}}
          onClick={() => setSelectedPendingMenu(false)}
        >
          Sent {sentRequests.length === 0 ? "" : sentRequests.length}
        </button>
      </div>
      <div className="bg-theme-surface overflow-y-scroll rounded-[8px] mt-1 w-[250px] h-[250px] p-1">
        {selectedPendingMenu ? (
          pendingRequests.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs mb-8 text-white/60">No Pending Requests</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 p-2 rounded-[8px]"
              >
                <Image
                  src={req.sender?.avatar}
                  alt=""
                  width={6}
                  height={6}
                  unoptimized
                  className="w-7 h-7 rounded-[8px]"
                />
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-sm text-white/90 truncate max-w-[120px]">
                    {req.sender?.username}
                  </span>
                  <span className="text-xs text-white/60">
                    {timeAgo(req._creationTime)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <div
                    onClick={() => handleReject(req.id, true)}
                    className="cursor-pointer"
                  >
                    <X className="text-white/40 hover:bg-theme-hover p-1 rounded-[8px]" />
                  </div>
                  <div
                    onClick={() => handleAccept(req.id)}
                    className="cursor-pointer"
                  >
                    <Check className="text-green-600 hover:bg-[#1c2d25] p-1 rounded-[8px]" />
                  </div>
                </div>
              </div>
            ))
          )
        ) : sentRequests.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs mb-8 text-white/60">No Sent Requests</p>
          </div>
        ) : (
          sentRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-3 p-2 rounded-[8px]"
            >
              <Image
                src={req.receiver?.avatar}
                alt=""
                width={6}
                height={6}
                unoptimized
                className="w-7 h-7 rounded-[8px]"
              />
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-sm text-white/90 truncate max-w-[120px]">
                  {req.receiver?.username}
                </span>
                <span className="text-xs text-white/60">
                  {timeAgo(req._creationTime)}
                </span>
              </div>
              <div className="flex gap-1">
                <div
                  onClick={() => handleReject(req.id, false)}
                  className="cursor-pointer"
                >
                  <X className="text-white/40 hover:bg-theme-hover p-1 rounded-[8px]" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
