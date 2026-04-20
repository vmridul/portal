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
  | "SWITCH_CALL"
  | null;

type UIState = {
  // Global Modal System
  activeModal: ModalType;
  modalData: any | null;
  setModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;

  // General App State
  pendingRequestMenu: boolean;
  selectedPendingMenu: boolean;
  menuOpen: boolean;
  leftMobileMenu: boolean;
  rightMobileMenu: boolean;
  setPendingRequestMenu: (v: boolean) => void;
  setSelectedPendingMenu: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setLeftMobileMenu: (v: boolean) => void;
  setRightMobileMenu: (v: boolean) => void;

  // Details Sidebar
  isSidebarOpen: boolean;
  sidebarTab: "info" | "media" | "calls";
  setSidebarOpen: (v: boolean) => void;
  setSidebarTab: (v: "info" | "media" | "calls") => void;
  toggleSidebar: (tab?: "info" | "media" | "calls") => void;

  // Active Call State
  activeCall: {
    callId: string;
    isMuted: boolean;
  } | null;
  setActiveCall: (call: { callId: string; isMuted: boolean } | null) => void;

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

  // Editing System
  editingMessage: {
    id: string;
    content: string;
  } | null;
  setEditingMessage: (msg: { id: string; content: string } | null) => void;
};

export const useUIStore = create<UIState>((set, get) => ({
  // Initialization
  activeModal: null,
  modalData: null,
  setModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  pendingRequestMenu: false,
  selectedPendingMenu: true,
  menuOpen: false,
  leftMobileMenu: false,
  rightMobileMenu: false,

  isSidebarOpen: false,
  sidebarTab: "info",
  activeCall: null,

  setActiveCall: (call) => set({ activeCall: call }),

  setPendingRequestMenu: (v) => set({ pendingRequestMenu: v }),
  setSelectedPendingMenu: (v) => set({ selectedPendingMenu: v }),
  setMenuOpen: (v) => set({ menuOpen: v }),
  setLeftMobileMenu: (v) => set({ leftMobileMenu: v }),
  setRightMobileMenu: (v) => set({ rightMobileMenu: v }),

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

  editingMessage: null,
  setEditingMessage: (msg) => set({ editingMessage: msg }),
}));
