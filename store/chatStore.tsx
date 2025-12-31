import { create } from "zustand";

interface ChatUIState {
  createDialog: boolean;
  joinDialog: boolean;
  logoutDialog: boolean;

  setCreateDialog: (value: boolean) => void;
  setJoinDialog: (value: boolean) => void;
  setLogoutDialog: (value: boolean) => void;
}

export const useChatStore = create<ChatUIState>((set) => ({
  createDialog: false,
  joinDialog: false,
  logoutDialog: false,

  setCreateDialog: (value) => set({ createDialog: value }),
  setJoinDialog: (value) => set({ joinDialog: value }),
  setLogoutDialog: (value) => set({ logoutDialog: value }),
}));
