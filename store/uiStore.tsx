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

  // Details Sidebar
  isSidebarOpen: boolean;
  sidebarTab: "info" | "media";
  setSidebarOpen: (v: boolean) => void;
  setSidebarTab: (v: "info" | "media") => void;
  toggleSidebar: (tab?: "info" | "media") => void;
  
  // Jump/Highlight System
  jumpedMessageId: string | null;
  setJumpedMessageId: (id: string | null) => void;

  // Lightbox System
  lightboxData: {
    isOpen: boolean;
    startIndex: number;
    items: { file_url: string; type: string; file_name?: string | null }[];
  } | null;
  openLightbox: (items: { file_url: string; type: string; file_name?: string | null }[], index?: number) => void;
  closeLightbox: () => void;
};

export const useUIStore = create<UIState>((set, get) => ({
  // Initialization
  activeModal: null,
  modalData: null,
  setModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  pendingRequestMenu: false,
  activeFriendPage: null,
  selectedPendingMenu: true,
  menuOpen: false,

  isSidebarOpen: false,
  sidebarTab: "info",

  setPendingRequestMenu: (v) => set({ pendingRequestMenu: v }),
  setActiveFriendPage: (v) => set({ activeFriendPage: v }),
  setSelectedPendingMenu: (v) => set({ selectedPendingMenu: v }),
  setMenuOpen: (v) => set({ menuOpen: v }),

  setSidebarOpen: (v) => set({ isSidebarOpen: v }),
  setSidebarTab: (v) => set({ sidebarTab: v }),
  toggleSidebar: (tab) => {
    const currentOpen = get().isSidebarOpen;
    const currentTab = get().sidebarTab;

    if (tab && tab !== currentTab) {
      set({ isSidebarOpen: true, sidebarTab: tab });
    } else {
      set({ isSidebarOpen: !currentOpen, sidebarTab: tab || currentTab });
    }
  },

  jumpedMessageId: null,
  setJumpedMessageId: (id) => set({ jumpedMessageId: id }),

  lightboxData: null,
  openLightbox: (items, index = 0) => set({ 
    lightboxData: { 
      isOpen: true, 
      startIndex: index, 
      items: items 
    } 
  }),
  closeLightbox: () => set({ lightboxData: null }),
}));
