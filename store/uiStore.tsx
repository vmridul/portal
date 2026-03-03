import { UUID } from "crypto";
import { create } from "zustand";

type UIState = {
  createDialog: boolean;
  joinDialog: boolean;
  logoutDialog: boolean;
  addFriendDialog: boolean;
  pendingRequestMenu: boolean;
  activeFriendPage: UUID | null;
  selectedPendingMenu: boolean;
  menuOpen: boolean;

  setCreateDialog: (v: boolean) => void;
  setJoinDialog: (v: boolean) => void;
  setLogoutDialog: (v: boolean) => void;
  setAddFriendDialog: (v: boolean) => void;
  setPendingRequestMenu: (v: boolean) => void;
  setActiveFriendPage: (v: UUID | null) => void;
  setSelectedPendingMenu: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  createDialog: false,
  joinDialog: false,
  logoutDialog: false,
  addFriendDialog: false,
  pendingRequestMenu: false,
  activeFriendPage: null,
  selectedPendingMenu: true,
  menuOpen: false,
  setCreateDialog: (v) => set({ createDialog: v }),
  setJoinDialog: (v) => set({ joinDialog: v }),
  setLogoutDialog: (v) => set({ logoutDialog: v }),
  setAddFriendDialog: (v) => set({ addFriendDialog: v }),
  setPendingRequestMenu: (v) => set({ pendingRequestMenu: v }),
  setActiveFriendPage: (v) => set({ activeFriendPage: v }),
  setSelectedPendingMenu: (v) => set({ selectedPendingMenu: v }),
  setMenuOpen: (v) => set({ menuOpen: v }),
}));
