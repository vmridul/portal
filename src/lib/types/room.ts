export interface UserRoom {
  room_id: string;
  memberCount: number;
  Rooms?: {
    room_name?: string;
    room_id?: string;
  } | null;
  owner_id?: string | null;
  joined_at?: number;
}
