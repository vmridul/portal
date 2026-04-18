"use client";

import { create } from "zustand";

interface JitsiState {
  roomId: string | null;
  isJoined: boolean;
  isMuted: boolean;
  participantCount: number;
  api: any | null;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  toggleMute: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalModule: any;
  }
}

let jitsiScriptLoaded = false;

function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (jitsiScriptLoaded) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      jitsiScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Jitsi"));
    document.body.appendChild(script);
  });
}

export const useJitsiStore = create<JitsiState>((set, get) => ({
  roomId: null,
  isJoined: false,
  isMuted: false,
  participantCount: 0,
  api: null,

  joinRoom: async (roomId: string) => {
    const state = get();
    if (state.isJoined) return;

    try {
      await loadJitsiScript();

      const domain = "meet.jit.si";
      const roomName = `portal-call-${roomId}-${Date.now().toString().slice(-6)}`;

      const api = new window.JitsiMeetExternalModule(domain, {
        roomName,
        parentNode: document.getElementById("jitsi-hidden-container") || createHiddenContainer(),
        width: "100%",
        height: "100%",
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: true,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          hideConferenceTimer: true,
          hideParticipantsStats: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GHOSTS: false,
          SHOW_BRAND_WATERMARK: false,
          TOOLBAR_BUTTONS: [],
        },
      });

      api.on("videoConferenceJoined", () => {
        set({ isJoined: true, roomId });
        api.executeCommand("toggleAudio");
      });

      api.on("videoConferenceLeft", () => {
        set({ isJoined: false, roomId: null, isMuted: false, participantCount: 0 });
      });

      api.on("participantJoined", () => {
        const participants = api.getParticipantsInfo();
        set({ participantCount: participants.length });
      });

      api.on("participantLeft", () => {
        const participants = api.getParticipantsInfo();
        set({ participantCount: participants.length });
      });

      set({ api, roomId, isJoined: true });
    } catch (err) {
      console.error("Failed to join Jitsi room:", err);
      throw err;
    }
  },

  leaveRoom: () => {
    const { api, isJoined } = get();
    if (api && isJoined) {
      api.dispose();
    }
    set({ api: null, isJoined: false, roomId: null, isMuted: false, participantCount: 0 });
  },

  toggleMute: () => {
    const { api, isMuted } = get();
    if (api) {
      api.executeCommand("toggleAudio");
      set({ isMuted: !isMuted });
    }
  },
}));

function createHiddenContainer(): HTMLElement {
  const container = document.createElement("div");
  container.id = "jitsi-hidden-container";
  container.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;";
  document.body.appendChild(container);
  return container;
}