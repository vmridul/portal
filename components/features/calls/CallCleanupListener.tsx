"use client";

import { useEffect } from "react";
import { useJitsiStore } from "@/store/jitsiStore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function CallCleanupListener() {
  const isJoined = useJitsiStore((state) => state.isJoined);
  const callId = useJitsiStore((state) => state.callId);
  const leaveActiveCall = useJitsiStore((state) => state.leaveActiveCall);
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
