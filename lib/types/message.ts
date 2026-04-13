import type { Id } from "@/convex/_generated/dataModel";
import type { User } from "./user";

export type MessageType = "text" | "image" | "video" | "file" | "system";

export type MessageSourceType = "room" | "friend";

export interface BaseMessage {
  _id: Id<"messages"> | Id<"friendMessages">;
  sender_id: string;
  content: string | null;
  file_storage_id?: Id<"_storage">;
  file_url: string | null;
  type: string | null;
  file_name: string | null;
  _creationTime: number;
}

export interface MessageWithSender extends BaseMessage {
  sender?: User | null;
}

export interface RoomMessage extends MessageWithSender {
  room_id: string;
}

export interface FriendMessage extends MessageWithSender {
  receiver_id: string;
}

export interface SendMessageArgs {
  type: MessageSourceType;
  room_id: string;
  msg: string | null;
  file_storage_id?: Id<"_storage">;
  file_type: string | null;
  file_name: string | null;
}

export interface DeleteMessageArgs {
  msg_id: Id<"messages"> | Id<"friendMessages">;
  type: "messages" | "friendMessages";
}

export interface MessageSearchResult {
  _id: Id<"messages">;
  room_id: string;
  sender_id: string;
  content: string | null;
  sender?: User | null;
  _creationTime: number;
}

export interface CursorPaginationResult<T> {
  messages: T[];
  nextCursor: number | null;
  hasMore: boolean;
}