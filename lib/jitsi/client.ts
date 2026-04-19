"use client";

import { APP_CONFIG } from "@/lib/constants/config";
import type {
  CallSessionTarget,
  CallSessionSnapshot,
} from "@/lib/types/call";
import { RemoteAudioSinkManager } from "@/lib/jitsi/audioSinkManager";
import type {
  JitsiConference,
  JitsiConnection,
  JitsiMeetJs,
  JitsiTrack,
} from "@/lib/jitsi/types";

const CLIENT_NODE = "http://jitsi.org/jitsimeet";

let scriptPromise: Promise<JitsiMeetJs> | null = null;
let sdkInitialized = false;

function getJitsiConfig() {
  const domain = APP_CONFIG.jitsi.domain;
  const conferenceHost =
    APP_CONFIG.jitsi.conferenceHost ?? `conference.${domain}`;
  const focusHost = APP_CONFIG.jitsi.focusHost ?? `focus.${domain}`;
  const serviceUrl =
    APP_CONFIG.jitsi.websocketUrl ?? `wss://${domain}/xmpp-websocket`;
  const sdkUrl = APP_CONFIG.jitsi.sdkUrl ?? `https://${domain}/libs/lib-jitsi-meet.min.js`;

  return {
    domain,
    conferenceHost,
    focusHost,
    serviceUrl,
    sdkUrl,
  };
}

function getConferenceName(callId: string): string {
  return `portal-call-${callId.replace(/[^a-zA-Z0-9]/g, "-")}`.toLowerCase();
}

function getTrackKey(track: JitsiTrack): string {
  return `${track.getParticipantId()}:${track.getType()}`;
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function loadScript(src: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    script.src = src;
    script.async = true;

    const handleLoad = () => {
      script.dataset.loaded = "true";
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("Failed to load Jitsi SDK"));
    };
    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (!existing) {
      document.body.appendChild(script);
    }
  });
}

async function loadJitsiSdk(): Promise<JitsiMeetJs> {
  if (typeof window === "undefined") {
    throw new Error("Jitsi is only available in the browser");
  }

  if (window.JitsiMeetJS) {
    return window.JitsiMeetJS;
  }

  if (!scriptPromise) {
    const { sdkUrl } = getJitsiConfig();
    scriptPromise = loadScript(sdkUrl).then(() => {
      if (!window.JitsiMeetJS) {
        throw new Error("Jitsi SDK not found after script load");
      }
      return window.JitsiMeetJS;
    });
  }

  return scriptPromise;
}

export interface JitsiSessionCallbacks {
  onStatusChange(snapshot: Partial<CallSessionSnapshot>): void;
  onJoined(): void;
  onDisconnected(): void;
  onError(message: string): void;
}

export class JitsiClient {
  private connection: JitsiConnection | null = null;
  private conference: JitsiConference | null = null;
  private localTracks: JitsiTrack[] = [];
  private readonly audioSinkManager = new RemoteAudioSinkManager();
  private connectionListeners: Array<{
    event: string;
    listener: (...args: unknown[]) => void;
  }> = [];
  private conferenceListeners: Array<{
    event: string;
    listener: (...args: unknown[]) => void;
  }> = [];
  private isDisconnecting = false;

  async connect(
    target: CallSessionTarget,
    callbacks: JitsiSessionCallbacks,
  ): Promise<void> {
    await this.disconnect({ notifyDisconnected: false });

    const JitsiMeetJS = await loadJitsiSdk();
    if (!sdkInitialized) {
      JitsiMeetJS.init({ disableAudioLevels: true });
      JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
      sdkInitialized = true;
    }

    const conferenceName = getConferenceName(target.callId);
    const { domain, conferenceHost, focusHost, serviceUrl } = getJitsiConfig();
    const connectionOptions = {
      hosts: {
        domain,
        muc: conferenceHost,
        focus: focusHost,
      },
      serviceUrl,
      clientNode: CLIENT_NODE,
    };

    const connection = new JitsiMeetJS.JitsiConnection(
      null,
      null,
      connectionOptions,
    );
    this.connection = connection;
    this.isDisconnecting = false;

    await new Promise<void>((resolve, reject) => {
      const handleConnected = async () => {
        try {
          const conference = connection.initJitsiConference(conferenceName, {
            openBridgeChannel: true,
          });
          this.conference = conference;

          this.bindConferenceListeners(JitsiMeetJS, conference, callbacks);

          const handleConferenceJoined = async () => {
            try {
              if (target.user.displayName) {
                conference.setDisplayName(target.user.displayName);
              }
              if (target.user.userId) {
                conference.setLocalParticipantProperty(
                  "userId",
                  target.user.userId,
                );
              }

              const localTracks = await JitsiMeetJS.createLocalTracks({
                devices: ["audio"],
              });
              this.localTracks = localTracks;
              for (const track of localTracks) {
                await conference.addTrack(track);
              }

              callbacks.onStatusChange({
                participantCount: conference.getParticipantCount(),
                isMuted: localTracks
                  .filter((track) => track.getType() === "audio")
                  .every((track) => track.isMuted()),
                error: null,
              });
              callbacks.onJoined();
              resolve();
            } catch (error) {
              const message = toErrorMessage(
                error,
                "Unable to access microphone",
              );
              callbacks.onError(message);
              reject(new Error(message));
              void this.disconnect({ notifyDisconnected: false });
            } finally {
              conference.off(
                JitsiMeetJS.events.conference.CONFERENCE_JOINED,
                handleConferenceJoined,
              );
            }
          };

          conference.on(
            JitsiMeetJS.events.conference.CONFERENCE_JOINED,
            handleConferenceJoined,
          );
          conference.join();
        } catch (error) {
          const message = toErrorMessage(error, "Failed to join Jitsi conference");
          callbacks.onError(message);
          reject(new Error(message));
          void this.disconnect({ notifyDisconnected: false });
        }
      };

      const handleFailed = (error: unknown) => {
        const message = toErrorMessage(error, "Jitsi connection failed");
        callbacks.onError(message);
        reject(new Error(message));
        void this.disconnect({ notifyDisconnected: false });
      };

      const handleDisconnected = () => {
        this.connection = null;
        if (!this.isDisconnecting) {
          callbacks.onDisconnected();
        }
      };

      this.addConnectionListener(
        connection,
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        handleConnected,
      );
      this.addConnectionListener(
        connection,
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        handleFailed,
      );
      this.addConnectionListener(
        connection,
        JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
        handleDisconnected,
      );
      connection.connect();
    });
  }

  async disconnect(options?: { notifyDisconnected?: boolean }): Promise<void> {
    void options?.notifyDisconnected;
    this.isDisconnecting = true;

    this.unbindConferenceListeners();
    this.unbindConnectionListeners();

    for (const track of this.localTracks) {
      try {
        track.stop?.();
      } catch {
        // Best effort.
      }

      try {
        await track.dispose?.();
      } catch {
        // Best effort.
      }
    }
    this.localTracks = [];

    this.audioSinkManager.clear();

    if (this.conference) {
      try {
        await this.conference.leave();
      } catch {
        // Best effort.
      }
      this.conference = null;
    }

    if (this.connection) {
      try {
        await this.connection.disconnect();
      } catch {
        // Best effort.
      }
      this.connection = null;
    }

    this.isDisconnecting = false;
  }

  async toggleMute(): Promise<boolean> {
    const audioTracks = this.localTracks.filter(
      (track) => track.getType() === "audio",
    );
    if (audioTracks.length === 0) {
      throw new Error("No local audio track available");
    }

    const shouldMute = audioTracks.some((track) => !track.isMuted());
    for (const track of audioTracks) {
      if (shouldMute) {
        await track.mute();
      } else {
        await track.unmute();
      }
    }

    return shouldMute;
  }

  private bindConferenceListeners(
    JitsiMeetJS: JitsiMeetJs,
    conference: JitsiConference,
    callbacks: JitsiSessionCallbacks,
  ): void {
    const updateParticipantCount = () => {
      callbacks.onStatusChange({
        participantCount: conference.getParticipantCount(),
      });
    };

    this.addConferenceListener(
      conference,
      JitsiMeetJS.events.conference.USER_JOINED,
      updateParticipantCount,
    );

    this.addConferenceListener(
      conference,
      JitsiMeetJS.events.conference.USER_LEFT,
      (participantId) => {
        updateParticipantCount();
        if (typeof participantId === "string") {
          this.audioSinkManager.detach(`${participantId}:audio`);
        }
      },
    );

    this.addConferenceListener(
      conference,
      JitsiMeetJS.events.conference.TRACK_ADDED,
      (rawTrack) => {
        const track = rawTrack as JitsiTrack;
        if (track.isLocal() || track.getType() !== "audio") {
          return;
        }

        if (track.getParticipantId() === conference.myUserId()) {
          return;
        }

        this.audioSinkManager.attach(getTrackKey(track), track);
      },
    );

    this.addConferenceListener(
      conference,
      JitsiMeetJS.events.conference.TRACK_REMOVED,
      (rawTrack) => {
        const track = rawTrack as JitsiTrack;
        if (track.isLocal() || track.getType() !== "audio") {
          return;
        }
        this.audioSinkManager.detach(getTrackKey(track));
      },
    );

    this.addConferenceListener(
      conference,
      JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED,
      (rawTrack) => {
        const track = rawTrack as JitsiTrack;
        if (track.isLocal()) {
          return;
        }
      },
    );

    this.addConferenceListener(
      conference,
      JitsiMeetJS.events.conference.CONFERENCE_LEFT,
      () => {
        if (!this.isDisconnecting) {
          callbacks.onDisconnected();
        }
      },
    );
  }

  private addConnectionListener(
    connection: JitsiConnection,
    event: string,
    listener: (...args: unknown[]) => void,
  ): void {
    connection.addEventListener(event, listener);
    this.connectionListeners.push({ event, listener });
  }

  private addConferenceListener(
    conference: JitsiConference,
    event: string,
    listener: (...args: unknown[]) => void,
  ): void {
    conference.on(event, listener);
    this.conferenceListeners.push({ event, listener });
  }

  private unbindConnectionListeners(): void {
    if (!this.connection) {
      this.connectionListeners = [];
      return;
    }

    for (const { event, listener } of this.connectionListeners) {
      this.connection.removeEventListener(event, listener);
    }
    this.connectionListeners = [];
  }

  private unbindConferenceListeners(): void {
    if (!this.conference) {
      this.conferenceListeners = [];
      return;
    }

    for (const { event, listener } of this.conferenceListeners) {
      this.conference.off(event, listener);
    }
    this.conferenceListeners = [];
  }
}
