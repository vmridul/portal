export type CallTrackType = "audio" | "video";

export interface CallTrack {
  id: string;
  participantId: string;
  type: CallTrackType;
  stream: MediaStream;
  track: MediaStreamTrack;
  isMuted: () => boolean;
  mute: () => Promise<void>;
  unmute: () => Promise<void>;
  dispose: () => void;
}

export interface CallParticipant {
  id: string;
  displayName?: string;
  userId?: string;
  isLocal: boolean;
}