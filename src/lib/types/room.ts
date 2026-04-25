export interface UserRoom {
  room_id: string;
  memberCount: number;
  Rooms?: {
    room_name?: string;
    room_id?: string;
  } | null;
  unread_count: number;
  owner_id?: string | null;
  joined_at?: number;
  last_msg_preview?: string;
  last_msg_time?: number;
  last_read_time?: number;
}
