import { UUID } from "crypto";
import { create } from "zustand";

export type ModalType = 
  | "CREATE_ROOM" 
  | "JOIN_ROOM" 
  | "LOGOUT" 
  | "ADD_FRIEND" 
  | "LEAVE_ROOM" 
  | "INFO" 
  | "COLOR" 
  | "MEDIA" 
  | "PROFILE" 
  | "ROOM_SETTINGS" 
  | null;

type UIState = {
  // Global Modal System
  activeModal: ModalType;
  modalData: any | null;
  setModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;

  // General App State
  pendingRequestMenu: boolean;
  activeFriendPage: UUID | null;
  selectedPendingMenu: boolean;
  menuOpen: boolean;

  setPendingRequestMenu: (v: boolean) => void;
  setActiveFriendPage: (v: UUID | null) => void;
  setSelectedPendingMenu: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  // Initialization
  activeModal: null,
  modalData: null,
  setModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  pendingRequestMenu: false,
  activeFriendPage: null,
  selectedPendingMenu: true,
  menuOpen: false,

  setPendingRequestMenu: (v) => set({ pendingRequestMenu: v }),
  setActiveFriendPage: (v) => set({ activeFriendPage: v }),
  setSelectedPendingMenu: (v) => set({ selectedPendingMenu: v }),
  setMenuOpen: (v) => set({ menuOpen: v }),
}));
