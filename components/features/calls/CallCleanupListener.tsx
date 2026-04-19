"use client";

import { useEffect } from "react";
import { useCallStore } from "@/store/callStore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function CallCleanupListener() {
  const isJoined = useCallStore((state) => state.isJoined);
  const callId = useCallStore((state) => state.callId);
  const leaveActiveCall = useCallStore((state) => state.leaveActiveCall);
  const leaveCall = useMutation(api.calls.leaveCall);

  useEffect(() => {
    const handleUnload = () => {
      if (isJoined && callId) {
        void leaveActiveCall();
        void leaveCall({ callId });
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [callId, isJoined, leaveActiveCall, leaveCall]);

  return null;
}
