"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useUserStore } from "@/store/useUserStore";

interface JitsiModule {
  externalApi: new (container: string, baseUrl: string, options: object) => JitsiExternalApi;
}

interface JitsiExternalApi {
  dispose: () => void;
  on: (event: string, callback: () => void) => void;
  executeCommand: (command: string, args?: unknown[]) => void;
  isMuted: () => boolean;
  getParticipantsInfo: () => { id: string; displayName: string }[];
}

declare global {
  interface Window {
    JitsiMeetExternalModule: JitsiModule;
  }
}

interface UseJitsiOptions {
  onJoin?: () => void;
  onLeave?: () => void;
}

export function useJitsi({ onJoin, onLeave }: UseJitsiOptions = {}) {
  const apiRef = useRef<JitsiExternalApi | null>(null);
  const containerRef = useRef<string | null>(null);
  const user = useUserStore((s) => s.user);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  const initializeJitsi = useCallback(async (roomId: string) => {
    return new Promise<void>(async (resolve, reject) => {
      if (!user) {
        reject(new Error("Not authenticated"));
        return;
      }

      const containerId = `jitsi-container-${roomId}-${Date.now()}`;
      containerRef.current = containerId;

      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => {
        try {
          const domain = "meet.jit.si";
          const roomName = `portal-call-${roomId}`;

          const api = new window.JitsiMeetExternalModule(domain, {
            roomName,
            parentNode: document.getElementById(containerId),
            width: "100%",
            height: "100%",
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: true,
              prejoinPageEnabled: false,
              disableDeepLinking: true,
              disableInviteFunctions: true,
              enableCalendarIntegration: false,
              enableClosePage: false,
              enableLogging: false,
              hideConferenceTimer: true,
              hideParticipantsStats: true,
              toolbarButtons: [
                "microphone",
                "camera",
                "desktop",
                "fullscreen",
                "floating",
                "hangup",
                "chat",
                "settings",
                "tileview",
                "selectBackground",
                "download",
                "help",
                "mute-everyone",
                "mute-video-everyone",
              ],
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              SHOW_BRAND_WATERMARK: false,
              DEFAULT_BACKGROUND: "#1a1a1a",
              DEFAULT_LOGO_URL: "",
              TOOLBAR_BUTTONS: [],
            },
          });

          api.on("videoConferenceJoined", () => {
            setIsJoined(true);
            onJoin?.();
            api.executeCommand("toggleAudio");
          });

          api.on("videoConferenceLeft", () => {
            setIsJoined(false);
            setIsMuted(false);
            setParticipantCount(0);
            onLeave?.();
          });

          api.on("participantJoined", () => {
            const participants = api.getParticipantsInfo();
            setParticipantCount(participants.length);
          });

          api.on("participantLeft", () => {
            const participants = api.getParticipantsInfo();
            setParticipantCount(participants.length);
          });

          apiRef.current = api;

          const container = document.getElementById(containerId);
          if (container) {
            container.setAttribute("style", "display: none;");
            container.setAttribute("data-hidden", "true");
          }

          resolve();
        } catch (err) {
          reject(err);
        }
      };
      script.onerror = () => reject(new Error("Failed to load Jitsi script"));
      document.body.appendChild(script);
    });
  }, [user, onJoin, onLeave]);

  const join = useCallback(async (roomId: string) => {
    try {
      await initializeJitsi(roomId);
    } catch (err) {
      console.error("Failed to join call:", err);
      throw err;
    }
  }, [initializeJitsi]);

  const leave = useCallback(() => {
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }
    if (containerRef.current) {
      const container = document.getElementById(containerRef.current);
      if (container) {
        container.remove();
      }
    }
    setIsJoined(false);
    setIsMuted(false);
    setParticipantCount(0);
  }, []);

  const toggleMute = useCallback(() => {
    if (apiRef.current) {
      const muted = apiRef.current.isMuted();
      apiRef.current.executeCommand("toggleAudio");
      setIsMuted(!muted);
    }
  }, []);

  const dispose = useCallback(() => {
    leave();
  }, [leave]);

  return {
    isJoined,
    isMuted,
    participantCount,
    join,
    leave,
    toggleMute,
    dispose,
  };
}