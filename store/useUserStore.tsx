import { create } from "zustand";
import { UUID } from "crypto";

export interface User {
  user_id: UUID;
  username: string;
  avatar: string;
  chatColor: string;
  created_at: Date;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
