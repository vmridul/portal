import type { Id } from "@/convex/_generated/dataModel";
import type { User } from "./user";

export type RoomRole = "owner" | "member";

export interface Room {
  room_id: string;
  room_name: string;
  is_group: boolean;
}

export interface RoomMember {
  room_id: string;
  user_id: string;
  role: RoomRole;
  unread_count: number;
  _creationTime: number;
}

export interface RoomMemberWithUser extends RoomMember {
  Users?: User | null;
}

export interface UserRoom {
  room_id: string;
  memberCount: number;
  owner_id: string | null;
  joined_at: number;
  unread_count: number;
  Rooms?: {
    room_name?: string;
    room_id?: string;
  } | null;
}

export interface RoomWithDetails extends UserRoom {
  Rooms?: Room | null;
}

export interface CreateRoomArgs {
  room_name: string;
  room_id: string;
}

export interface JoinRoomArgs {
  room_id: string;
}

export interface RenameRoomArgs {
  room_id: string;
  new_name: string;
}

export interface LeaveRoomArgs {
  room_id: string;
}

export interface DeleteRoomArgs {
  room_id: string;
}

export interface RoomDetails {
  room: Room | null;
  members: RoomMemberWithUser[];
}