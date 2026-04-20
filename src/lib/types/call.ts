import type { Id } from "@/convex/_generated/dataModel";

export type CallId = Id<"calls">;

export type CallSessionStatus = "idle" | "joining" | "joined" | "leaving" | "error";

export interface CallUserInfo {
  userId?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface CallRoomMetadata {
  id: string;
  name: string;
}

export interface CallSessionTarget {
  callId: CallId;
  room: CallRoomMetadata;
  user: CallUserInfo;
}

export interface CallSessionSnapshot {
  status: CallSessionStatus;
  callId: CallId | null;
  actualRoomId: string | null;
  roomName: string | null;
  isMuted: boolean;
  participantCount: number;
  error: string | null;
}
