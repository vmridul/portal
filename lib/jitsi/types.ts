export type JitsiTrackType = "audio" | "video";

export interface JitsiTrack {
  isLocal(): boolean;
  getType(): JitsiTrackType | string;
  getParticipantId(): string;
  attach(element: HTMLElement): void;
  detach(element?: HTMLElement): void;
  mute(): Promise<void>;
  unmute(): Promise<void>;
  isMuted(): boolean;
  stop?(): void;
  dispose?(): Promise<void> | void;
}

export interface JitsiParticipant {
  getProperty(name: string): string | undefined;
}

export interface JitsiConference {
  on(event: string, listener: (...args: unknown[]) => void): void;
  off(event: string, listener: (...args: unknown[]) => void): void;
  join(): void;
  leave(): Promise<void> | void;
  addTrack(track: JitsiTrack): Promise<void> | void;
  myUserId(): string;
  getParticipantCount(): number;
  getParticipantById(id: string): JitsiParticipant | undefined;
  setDisplayName(name: string): void;
  setLocalParticipantProperty(name: string, value: string): void;
}

export interface JitsiConnection {
  addEventListener(event: string, listener: (...args: unknown[]) => void): void;
  removeEventListener(event: string, listener: (...args: unknown[]) => void): void;
  connect(): void;
  disconnect(): Promise<void> | void;
  initJitsiConference(name: string, options: Record<string, unknown>): JitsiConference;
}

export interface JitsiMeetJs {
  events: {
    connection: {
      CONNECTION_ESTABLISHED: string;
      CONNECTION_FAILED: string;
      CONNECTION_DISCONNECTED: string;
    };
    conference: {
      CONFERENCE_JOINED: string;
      CONFERENCE_LEFT: string;
      USER_JOINED: string;
      USER_LEFT: string;
      TRACK_ADDED: string;
      TRACK_REMOVED: string;
      TRACK_MUTE_CHANGED: string;
    };
  };
  logLevels: {
    ERROR: unknown;
  };
  init(options: Record<string, unknown>): void;
  setLogLevel(level: unknown): void;
  createLocalTracks(options: {
    devices: Array<"audio" | "video">;
  }): Promise<JitsiTrack[]>;
  JitsiConnection: new (
    token: string | null,
    roomName: string | null,
    options: Record<string, unknown>,
  ) => JitsiConnection;
}

declare global {
  interface Window {
    JitsiMeetJS?: JitsiMeetJs;
  }
}
