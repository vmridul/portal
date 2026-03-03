import { create } from "zustand";


export interface User {
  user_id: string;
  username: string;
  avatar?: string;
  chatColor?: string;
  _creationTime: number;
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
