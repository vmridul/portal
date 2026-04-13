"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { MessageWithSender, MessageSourceType } from "@/lib/types";

interface UseMediaFilesOptions {
  roomId: string;
  type: MessageSourceType;
}

export function useMediaFiles({ roomId, type }: UseMediaFilesOptions) {
  const mediaFiles = useQuery(api.messages.getMedia, { room_id: roomId, type });
  return {
    mediaFiles: mediaFiles ?? [],
    isLoading: mediaFiles === undefined,
  };
}