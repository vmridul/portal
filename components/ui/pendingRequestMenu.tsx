import { useUIStore } from "@/store/uiStore";
import { useEffect, useState } from "react";
import { timeAgo } from "@/app/actions/timeAgo";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { acceptFriendReq } from "@/app/actions/acceptFriendReq";
import { rejectFriendReq } from "@/app/actions/rejectFriendReq";

export default function PendingRequestMenu({
  pendingRequests,
  sentRequests,
  setPendingRequests,
  setSentRequests,
}: {
  pendingRequests: any[];
  sentRequests: any[];
  setPendingRequests: (req: any[]) => void;
  setSentRequests: (req: any[]) => void;
}) {
  const { selectedPendingMenu, setSelectedPendingMenu, pendingRequestMenu } =
    useUIStore();

  const removeRequest = (req_id: string) => {
    if (selectedPendingMenu) {
      const updatedRequests = pendingRequests.filter(
        (req) => req.id !== req_id
      );
      setPendingRequests(updatedRequests);
    } else {
      const updatedRequests = sentRequests.filter((req) => req.id !== req_id);
      setSentRequests(updatedRequests);
    }
  };
  const removeSentRequest = (req_id: string) => {
    const updatedRequests = sentRequests.filter((req) => req.id !== req_id);
    setSentRequests(updatedRequests);
  };

  return (
    <div
      className={`${
        pendingRequestMenu
          ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
          : "translate-y-1 scale-95 opacity-0 pointer-events-none"
      } duration-200 transition-all ease-in-out z-[9000] absolute p-2 rounded-[8px] top-10 right-4 bg-[#080f17] border border-[#211f31]`}
    >
      <div className="bg-[#201e30] text-sm text-white h-9 rounded-[8px] w-fit p-1 flex items-center gap-1">
        <button
          className={`border ${
            selectedPendingMenu
              ? "bg-[#2b2840]"
              : "text-white/70 border-opacity-0"
          } border-[#373545] p-1 px-3 rounded-[10px]`}
          onClick={() => setSelectedPendingMenu(true)}
        >
          Pending {pendingRequests.length === 0 ? "" : pendingRequests.length}
        </button>
        <button
          className={`border ${
            selectedPendingMenu
              ? "text-white/70 border-opacity-0"
              : "bg-[#2b2840] border"
          } border-[#373545] p-1 px-3 rounded-[10px]`}
          onClick={() => setSelectedPendingMenu(false)}
        >
          Sent {sentRequests.length === 0 ? "" : sentRequests.length}
        </button>
      </div>
      <div className="bg-[#201e30] overflow-y-scroll rounded-[8px] mt-1 w-[250px] h-[250px] p-1">
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
                  <span className="text-sm text-white/90">
                    {req.sender?.username}
                  </span>
                  <span className="text-xs text-white/60">
                    {timeAgo(req.created_at)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <div
                    onClick={() => {
                      rejectFriendReq(req.id, "toast");
                      removeRequest(req.id);
                    }}
                    className="cursor-pointer"
                  >
                    <X className="text-white/40 hover:bg-[#2b2840] p-1 rounded-[8px]" />
                  </div>
                  <div
                    onClick={() => {
                      acceptFriendReq(req.id);
                      removeRequest(req.id);
                    }}
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
                <span className="text-sm text-white/90">
                  {req.receiver?.username}
                </span>
                <span className="text-xs text-white/60">
                  {timeAgo(req.created_at)}
                </span>
              </div>
              <div className="flex gap-1">
                <div
                  onClick={() => {
                    rejectFriendReq(req.id, "notoast");
                    removeSentRequest(req.id);
                  }}
                  className="cursor-pointer"
                >
                  <X className="text-white/40 hover:bg-[#2b2840] p-1 rounded-[8px]" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
