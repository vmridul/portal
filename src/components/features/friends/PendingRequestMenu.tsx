import * as Popover from "@radix-ui/react-popover";
import * as Tabs from "@radix-ui/react-tabs";
import { useUIStore } from "@/store/uiStore";
import { timeAgo } from "@/lib/utils/date";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  useFriendActions,
  type PendingRequest,
  type SentRequest,
} from "@/hooks";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import React from "react";

interface RequestUser {
  avatar?: string;
  username?: string;
}

interface RequestItemProps {
  user: RequestUser;
  createdAt: number;
  actions: React.ReactNode;
}

function RequestItem({ user, createdAt, actions }: RequestItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-[6px]">
      <Image
        src={user.avatar || "/assets/defaultAvatar.png"}
        width={32}
        height={32}
        unoptimized
        alt=""
        className="w-8 h-8 rounded-[6px]"
      />
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm truncate">{user.username}</div>
        <div className="text-white/40 text-xs">{timeAgo(createdAt)}</div>
      </div>
      {actions}
    </div>
  );
}

interface PendingRequestMenuProps {
  pendingRequests: PendingRequest[];
  sentRequests: SentRequest[];
}

export default function PendingRequestMenu({
  pendingRequests,
  sentRequests,
}: PendingRequestMenuProps) {
  const { pendingRequestMenu, setPendingRequestMenu } = useUIStore();
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
    <Popover.Root
      open={pendingRequestMenu}
      onOpenChange={setPendingRequestMenu}
    >
      <Popover.Anchor asChild>
        <div />
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          className="z-[9000] p-2 rounded-[8px] h-[35%] min-w-[250px] bg-theme-base border border-theme-border"
          sideOffset={8}
          align="end"
          onEscapeKeyDown={() => setPendingRequestMenu(false)}
        >
          <Tabs.Root defaultValue="received" className="flex flex-col h-full">
            <Tabs.List className="bg-theme-surface text-sm text-white h-9 rounded-[8px] w-fit p-1 flex items-center gap-1">
              <Tabs.Trigger
                value="received"
                className="px-3 py-1 rounded-[6px] data-[state=active]:bg-theme-hover hover:bg-theme-hover"
              >
                Received
              </Tabs.Trigger>
              <Tabs.Trigger
                value="sent"
                className="px-3 py-1 rounded-[6px] data-[state=active]:bg-theme-hover hover:bg-theme-hover"
              >
                Sent
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content
              value="received"
              className="mt-2 flex flex-col gap-1 max-h-[200px] overflow-y-auto"
            >
              {pendingRequests.length === 0 ? (
                <div className="text-white/40 text-xs p-2 mx-auto my-[30%]">
                  No pending requests
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <RequestItem
                    key={request.id}
                    user={request.sender ?? {}}
                    createdAt={request._creationTime}
                    actions={
                      <>
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="p-1 rounded-[6px] hover:bg-theme-hover"
                        >
                          <HugeiconsIcon
                            icon={Tick01Icon}
                            className="w-4 h-4 text-green-500"
                          />
                        </button>
                        <button
                          onClick={() => handleReject(request.id, true)}
                          className="p-1 rounded-[6px] hover:bg-theme-hover"
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            className="w-4 h-4 text-gray-300"
                          />
                        </button>
                      </>
                    }
                  />
                ))
              )}
            </Tabs.Content>

            <Tabs.Content
              value="sent"
              className="mt-2 flex flex-col gap-1 max-h-[200px] overflow-y-auto"
            >
              {sentRequests.length === 0 ? (
                <div className="text-white/40 text-xs p-2 mx-auto my-[30%]">
                  No sent requests
                </div>
              ) : (
                sentRequests.map((request) => (
                  <RequestItem
                    key={request.id}
                    user={request.receiver ?? {}}
                    createdAt={request._creationTime}
                    actions={
                      <button
                        onClick={() => handleReject(request.id, false)}
                        className="p-1 rounded-[6px] hover:bg-theme-hover"
                      >
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          className="w-4 h-4 text-gray-300"
                        />
                      </button>
                    }
                  />
                ))
              )}
            </Tabs.Content>
          </Tabs.Root>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
