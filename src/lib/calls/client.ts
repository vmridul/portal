"use client";

import type {
  CallSessionTarget,
  CallSessionSnapshot,
  UpdateMediaStateFn,
} from "@/lib/types/call";
import { RemoteAudioSinkManager } from "./audioSinkManager";

import type PeerType from "peerjs";

interface PeerCallbacks {
  onStatusChange(snapshot: Partial<CallSessionSnapshot>): void;
  onJoined(): void;
  onDisconnected(): void;
  onError(message: string): void;
}

export class CallClient {
  private peer: PeerType | null = null;
  private connections = new Map<string, any>();
  private localStream: MediaStream | null = null;
  private readonly audioSinkManager = new RemoteAudioSinkManager();
  private callbacks: PeerCallbacks | null = null;
  private target: CallSessionTarget | null = null;
  private isDisconnecting = false;
  private isPeerOpen = false;
  private hasJoined = false; // B2: track whether onJoined was ever fired
  private pendingCalls = new Set<string>();
  private lastPeerMappings: { userId: string; peerId: string }[] | null = null;
  private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private localVideoStream: MediaStream | null = null;
  private remoteStreams = new Map<string, MediaStream>(); // E8: unified to Map
  private dummyVideoTrack: MediaStreamTrack | null = null;
  private updateMediaState: UpdateMediaStateFn | null = null;

  // Screen sharing
  private screenShareStream: MediaStream | null = null;
  private isScreenSharing = false;
  private screenShareConnections = new Map<string, any>();
  private remoteScreenShareStreams = new Map<string, MediaStream>();

  // Device management
  private availableDevices: MediaDeviceInfo[] = [];
  private selectedAudioDeviceId: string | null = null;
  private selectedVideoDeviceId: string | null = null;

  // Peer-to-user mapping
  private peerToUser: Map<string, string> = new Map();

  // Active speaker detection
  private audioContext: AudioContext | null = null;
  private analysers: Map<string, AnalyserNode> = new Map();
  private analyserSources: Map<string, MediaStreamAudioSourceNode> = new Map(); // B11/B12: track source nodes for cleanup
  private activeSpeakers: Set<string> = new Set();
  private speakerDetectionLoopId: ReturnType<typeof setInterval> | null = null;
  private combinedLocalStream: MediaStream | null = null;

  // B6: store devicechange handler reference for cleanup
  private deviceChangeHandler: (() => void) | null = null;

  setUpdateMediaState(fn: UpdateMediaStateFn) {
    this.updateMediaState = fn;
  }

  async connect(
    target: CallSessionTarget,
    callbacks: PeerCallbacks,
  ): Promise<string> {
    // B15: guard against double-connect — disconnect existing connection first
    if (this.peer) {
      await this.disconnect();
    }

    this.target = target;
    this.callbacks = callbacks;
    this.isDisconnecting = false;
    this.isPeerOpen = false;
    this.hasJoined = false; // B2: reset join tracking
    this.pendingCalls.clear();
    this.lastPeerMappings = null;

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        this.selectedAudioDeviceId = audioTrack.getSettings().deviceId || null;
      }

      // Initialize devices list
      await this.refreshDevices();

      // B6: store handler reference for cleanup in disconnect()
      this.deviceChangeHandler = () => {
        this.refreshDevices().catch(() => {});
      };
      navigator.mediaDevices.addEventListener(
        "devicechange",
        this.deviceChangeHandler,
      );

      const { default: Peer } = await import("peerjs");

      // E1: use "-" delimiter instead of "_" to avoid userId collision
      // when userId itself contains underscores. Convex document IDs are
      // base62 (no hyphens), so "-" is a safe separator.
      const uniquePeerId = `${target.userId}-${Math.random().toString(36).substring(2, 9)}`;

      this.peer = new Peer(uniquePeerId, {
        host: "0.peerjs.com",
        port: 443,
        path: "/",
        secure: true,
        debug: 1,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun.services.mozilla.com" },
          ],
        },
      });

      this.setupPeerListeners();
      this.setupAudioContext();
      this.setupLocalSpeakerDetection();

      // B1: onJoined is now called inside peer.on("open") handler
      // (in setupPeerListeners), ensuring the peer is actually open
      // before the store sets status to "joined"
      return uniquePeerId;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to initialize call";
      callbacks.onError(message);
      await this.disconnect();
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.isDisconnecting = true;
    this.lastPeerMappings = null;

    // B5: clear sync debounce timer to prevent firing on destroyed peer
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
      this.syncDebounceTimer = null;
    }

    if (this.speakerDetectionLoopId) {
      clearInterval(this.speakerDetectionLoopId);
      this.speakerDetectionLoopId = null;
    }

    this.connections.forEach((conn) => {
      try {
        conn.close();
      } catch {
        /* connection may already be closed */
      }
    });
    this.connections.clear();

    // Clean up screen share connections
    this.screenShareConnections.forEach((conn) => {
      try {
        conn.close();
      } catch {
        /* already closed */
      }
    });
    this.screenShareConnections.clear();

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;

    this.localVideoStream?.getTracks().forEach((track) => track.stop());
    this.localVideoStream = null;

    // Clean up screen share stream
    this.screenShareStream?.getTracks().forEach((track) => track.stop());
    this.screenShareStream = null;
    this.isScreenSharing = false;

    // B3: stop dummy video track and release the underlying canvas stream
    this.dummyVideoTrack?.stop();
    this.dummyVideoTrack = null;

    // B4: close AudioContext to free browser audio resources
    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch {
        // AudioContext may already be closed
      }
      this.audioContext = null;
    }

    // B6: remove devicechange handler
    if (this.deviceChangeHandler) {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        this.deviceChangeHandler,
      );
      this.deviceChangeHandler = null;
    }

    // E8/B7: clear both remote stream maps
    this.remoteStreams.clear();
    this.remoteScreenShareStreams.clear();
    this.peerToUser.clear();

    // B11/B12: disconnect all analyser source nodes before clearing
    this.analyserSources.forEach((source) => {
      try {
        source.disconnect();
      } catch {
        /* already disconnected */
      }
    });
    this.analyserSources.clear();
    this.analysers.clear();
    this.activeSpeakers.clear();
    this.audioSinkManager.clear();

    // B8: null combinedLocalStream to release stale reference
    this.combinedLocalStream = null;

    // B9: clear pending calls to prevent retry timers firing on destroyed peer
    this.pendingCalls.clear();

    // B2: only fire onDisconnected if we ever successfully joined.
    // When connect() fails before the peer opens, onJoined was never called,
    // so onDisconnected would incorrectly reset the error state to idle.
    if (this.hasJoined) {
      this.callbacks?.onDisconnected();
    }
    this.hasJoined = false;
    this.isDisconnecting = false;
    this.isPeerOpen = false;
  }

  async toggleMute(): Promise<boolean> {
    // B13: return true (muted) when no stream/track — the user is
    // effectively muted because there's no audio, not "unmuted"
    if (!this.localStream) return true;
    const track = this.localStream.getAudioTracks()[0];
    if (!track) return true;

    track.enabled = !track.enabled;
    const isMuted = !track.enabled;

    if (this.target?.callId && this.updateMediaState) {
      this.updateMediaState({ callId: this.target.callId, isMuted }).catch(
        () => {},
      );
    }

    this.updateCombinedLocalStream();
    this.broadcastStatus();
    return isMuted;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;

    if (this.localVideoStream) {
      // Video is on — turn it off by fully releasing the camera
      this.localVideoStream.getVideoTracks().forEach((t) => {
        // Replace with dummy track in all peer connections
        this.connections.forEach((call) => {
          const pc = call.peerConnection as RTCPeerConnection;
          const sender = pc
            ?.getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender && this.dummyVideoTrack) {
            void sender.replaceTrack(this.dummyVideoTrack);
          }
        });
        t.stop();
      });
      this.localVideoStream = null;

      this.updateCombinedLocalStream();

      if (this.target?.callId && this.updateMediaState) {
        this.updateMediaState({
          callId: this.target.callId,
          isVideoOn: false,
        }).catch(() => {});
      }

      this.broadcastStatus();
      return false;
    }

    // No video stream yet — acquire camera on first toggle
    try {
      this.localVideoStream = await navigator.mediaDevices.getUserMedia({
        video: this.selectedVideoDeviceId
          ? { deviceId: { exact: this.selectedVideoDeviceId } }
          : true,
      });

      const videoTrack = this.localVideoStream.getVideoTracks()[0];
      if (videoTrack) {
        this.selectedVideoDeviceId = videoTrack.getSettings().deviceId || null;
        this.connections.forEach((call) => {
          const pc = call.peerConnection as RTCPeerConnection;
          const sender = pc
            ?.getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            void sender.replaceTrack(videoTrack);
          } else {
            // E3: addTrack fallback — must trigger renegotiation
            // so the remote peer sees the new video track
            const stream = this.getCombinedLocalStream();
            if (stream && pc) {
              pc.addTrack(videoTrack, stream);
              this.triggerRenegotiation(pc);
            }
          }
        });
      }

      if (this.target?.callId && this.updateMediaState) {
        this.updateMediaState({
          callId: this.target.callId,
          isVideoOn: true,
        }).catch(() => {});
      }

      this.updateCombinedLocalStream();
      this.broadcastStatus();
      return true;
    } catch (err) {
      console.error("[CallClient] Failed to get video stream:", err);
      return false;
    }
  }

  async refreshDevices(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices;
      this.broadcastStatus();
    } catch (err) {
      console.error("[CallClient] Failed to enumerate devices:", err);
    }
  }

  async setAudioSource(deviceId: string): Promise<void> {
    this.selectedAudioDeviceId = deviceId;
    if (!this.localStream) {
      this.broadcastStatus();
      return;
    }

    try {
      const oldTrack = this.localStream.getAudioTracks()[0];
      // Only switch immediately if we aren't "effectively" off?
      // Actually for audio we switch immediately if localStream exists,
      // but we preserve the enabled state.
      const isMuted = oldTrack ? !oldTrack.enabled : false;

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      const newTrack = newStream.getAudioTracks()[0];

      if (newTrack) {
        newTrack.enabled = !isMuted;
        if (oldTrack) {
          oldTrack.stop();
          this.localStream.removeTrack(oldTrack);
        }
        this.localStream.addTrack(newTrack);

        this.connections.forEach((call) => {
          const pc = call.peerConnection as RTCPeerConnection;
          const sender = pc
            ?.getSenders()
            .find((s) => s.track?.kind === "audio");
          if (sender) void sender.replaceTrack(newTrack);
        });

        this.updateCombinedLocalStream();
        this.setupLocalSpeakerDetection();
      }
    } catch (err) {
      console.error("[CallClient] Failed to set audio source:", err);
    }
    this.broadcastStatus();
  }

  async setVideoSource(deviceId: string): Promise<void> {
    this.selectedVideoDeviceId = deviceId;

    // If video is OFF, just remember the device and broadcast
    if (!this.localVideoStream) {
      this.broadcastStatus();
      return;
    }

    // If video is ON, switch immediately
    try {
      const oldTrack = this.localVideoStream.getVideoTracks()[0];

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      const newTrack = newStream.getVideoTracks()[0];

      if (newTrack) {
        if (oldTrack) {
          oldTrack.stop();
          this.localVideoStream.removeTrack(oldTrack);
        }
        this.localVideoStream.addTrack(newTrack);

        this.connections.forEach((call) => {
          const pc = call.peerConnection as RTCPeerConnection;
          const sender = pc
            ?.getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) void sender.replaceTrack(newTrack);
        });

        this.updateCombinedLocalStream();
      }
    } catch (err) {
      console.error("[CallClient] Failed to set video source:", err);
    }
    this.broadcastStatus();
  }

  syncParticipants(peerMappings: { userId: string; peerId: string }[]): void {
    if (!this.peer || !this.target || !this.localStream) return;

    this.lastPeerMappings = peerMappings;
    peerMappings.forEach((m) => this.peerToUser.set(m.peerId, m.userId));

    if (!this.isPeerOpen) return;

    if (this.syncDebounceTimer) clearTimeout(this.syncDebounceTimer);
    this.syncDebounceTimer = setTimeout(() => {
      this.syncDebounceTimer = null;
      this.doSyncParticipants(peerMappings);
    }, 1000);
  }

  async toggleScreenShare(): Promise<boolean> {
    if (this.isScreenSharing && this.screenShareStream) {
      // Stop screen sharing
      this.screenShareStream.getTracks().forEach((t) => t.stop());
      this.screenShareStream = null;
      this.isScreenSharing = false;

      // Close all screen share peer connections
      this.screenShareConnections.forEach((conn) => {
        try {
          conn.close();
        } catch {
          /* already closed */
        }
      });
      this.screenShareConnections.clear();

      if (this.target?.callId && this.updateMediaState) {
        this.updateMediaState({
          callId: this.target.callId,
          isScreenSharing: false,
        }).catch(() => {});
      }

      this.broadcastStatus();
      return false;
    }

    // Start screen sharing
    try {
      this.screenShareStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false,
      });

      this.isScreenSharing = true;

      // Listen for user stopping via browser's native "Stop sharing" button
      const videoTrack = this.screenShareStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          this.isScreenSharing = false;
          this.screenShareStream = null;
          this.screenShareConnections.forEach((conn) => {
            try {
              conn.close();
            } catch {
              /* already closed */
            }
          });
          this.screenShareConnections.clear();

          if (this.target?.callId && this.updateMediaState) {
            this.updateMediaState({
              callId: this.target.callId,
              isScreenSharing: false,
            }).catch(() => {});
          }

          this.broadcastStatus();
        };
      }

      // Send screen share stream to all connected peers
      this.initiateScreenShareCalls();

      if (this.target?.callId && this.updateMediaState) {
        this.updateMediaState({
          callId: this.target.callId,
          isScreenSharing: true,
        }).catch(() => {});
      }

      this.broadcastStatus();
      return true;
    } catch (err) {
      console.error("[CallClient] Failed to get screen share:", err);
      this.isScreenSharing = false;
      this.screenShareStream = null;
      return false;
    }
  }

  // --- Private ---

  private doSyncParticipants(
    peerMappings: { userId: string; peerId: string }[],
  ): void {
    if (!this.peer || !this.target || !this.localStream) return;

    const currentUserId = this.target.userId;
    if (!currentUserId) return;

    peerMappings.forEach(({ userId, peerId }) => {
      this.peerToUser.set(peerId, userId);
      if (userId === currentUserId) return;
      if (this.connections.has(peerId) || this.pendingCalls.has(peerId)) return;

      this.pendingCalls.add(peerId);
      this.initiateCall(peerId);
    });

    this.broadcastStatus();
  }

  private setupPeerListeners(): void {
    if (!this.peer) return;

    this.peer.on("open", () => {
      this.isPeerOpen = true;

      // B1: fire onJoined only after the peer is actually open,
      // so syncParticipants calls won't be silently dropped
      if (!this.hasJoined) {
        this.hasJoined = true;
        this.callbacks?.onJoined();
      }

      if (this.lastPeerMappings) {
        this.doSyncParticipants(this.lastPeerMappings);
      }
    });

    this.peer.on("disconnected", () => {
      this.isPeerOpen = false;
      // B14: attempt reconnection on signaling disconnect
      // Without this, a dropped WebSocket to the signaling server
      // makes the peer unreachable and all calls fail silently
      if (!this.isDisconnecting && this.peer) {
        try {
          this.peer.reconnect();
        } catch (err) {
          console.error("[CallClient] Reconnect attempt failed:", err);
        }
      }
    });

    this.peer.on("call", (incomingCall) => {
      const metadata = incomingCall.metadata;

      if (metadata?.type === "screen-share") {
        // This is a screen share call — handle separately
        this.handleIncomingScreenShareCall(incomingCall);
        return;
      }

      this.updateCombinedLocalStream();
      const combined = this.combinedLocalStream;
      if (!combined) return;

      incomingCall.answer(combined);
      this.setupCallHandlers(incomingCall);
    });

    this.peer.on("error", (err) => {
      if (err.type === "peer-unavailable") return;
      console.error("[CallClient] Peer error:", err.type, err);
      this.callbacks?.onError(`Call system error: ${err.type}`);
    });
  }

  private initiateCall(remotePeerId: string, retryCount = 0): void {
    if (!this.peer || this.isDisconnecting) return;

    this.updateCombinedLocalStream();
    const combined = this.combinedLocalStream;
    if (!combined) return;

    try {
      const outgoingCall = this.peer.call(remotePeerId, combined);
      if (!outgoingCall) {
        throw new Error("PeerJS failed to create outgoing call object");
      }
      this.setupCallHandlers(outgoingCall);

      outgoingCall.on("close", () => {
        this.handleCallRetry(remotePeerId, retryCount);
      });

      outgoingCall.on("error", (err: any) => {
        if (
          err?.type === "peer-unavailable" ||
          err?.msg?.includes("unavailable")
        ) {
          this.handleCallRetry(remotePeerId, retryCount);
        } else {
          console.warn("[CallClient] initiateCall error:", err);
          this.handleCallRetry(remotePeerId, retryCount);
        }
      });
    } catch (err) {
      console.warn("[CallClient] initiateCall error:", err);
      this.handleCallRetry(remotePeerId, retryCount);
    }
  }

  private handleCallRetry(remotePeerId: string, retryCount: number): void {
    if (this.connections.has(remotePeerId)) return;
    if (retryCount >= 3 || !this.peer || this.isDisconnecting) {
      this.pendingCalls.delete(remotePeerId);
      return;
    }

    // B10: re-add to pendingCalls before the setTimeout to prevent
    // syncParticipants from creating a duplicate call during the retry window.
    // Without this, the peerId is in neither connections nor pendingCalls
    // during the 2-4s delay, so syncParticipants initiates a second call.
    this.pendingCalls.add(remotePeerId);

    setTimeout(
      () => {
        this.initiateCall(remotePeerId, retryCount + 1);
      },
      2000 + retryCount * 1000,
    );
  }

  private setupCallHandlers(call: any): void {
    const remotePeerId = call.peer;
    this.connections.set(remotePeerId, call);
    this.pendingCalls.delete(remotePeerId);

    // If we're screen sharing, also send screen to this newly connected peer
    if (this.isScreenSharing && this.screenShareStream) {
      this.initiateScreenShareCallToPeer(remotePeerId);
    }

    // E4: monitor ICE connection state for failures and auto-recovery
    const pc = call.peerConnection as RTCPeerConnection;
    if (pc) {
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        if (state === "failed") {
          // ICE failed — attempt restart
          try {
            pc.restartIce();
          } catch (err) {
            console.error("[CallClient] ICE restart failed:", err);
          }
        } else if (state === "disconnected") {
          // ICE disconnected — wait briefly, then restart if still disconnected
          setTimeout(() => {
            if (pc.iceConnectionState === "disconnected") {
              try {
                pc.restartIce();
              } catch (err) {
                console.error(
                  "[CallClient] ICE restart after disconnect failed:",
                  err,
                );
              }
            }
          }, 5000);
        }
      };
    }

    call.on("stream", (remoteStream: MediaStream) => {
      this.pendingCalls.delete(remotePeerId);
      this.remoteStreams.set(remotePeerId, remoteStream);

      remoteStream.onaddtrack = () => this.broadcastStatus();
      remoteStream.onremovetrack = () => this.broadcastStatus();

      // Active speaker detection
      this.setupAudioContext();
      if (!this.audioContext) return;

      const audioTrack = remoteStream.getAudioTracks()[0];
      if (audioTrack) {
        try {
          // B11: clean up old analyser/source before creating new one.
          // PeerJS can fire "stream" multiple times (e.g. on renegotiation),
          // and each firing would leak the previous MediaStreamSourceNode.
          const oldSource = this.analyserSources.get(remotePeerId);
          if (oldSource) {
            try {
              oldSource.disconnect();
            } catch {
              /* already disconnected */
            }
          }

          const source = this.audioContext.createMediaStreamSource(
            new MediaStream([audioTrack]),
          );
          const analyser = this.audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.4;
          source.connect(analyser);
          this.analysers.set(remotePeerId, analyser);
          this.analyserSources.set(remotePeerId, source);
        } catch (err) {
          console.error("Failed to setup audio analyser", err);
        }
      }

      this.audioSinkManager.attach({
        id: remotePeerId,
        participantId: remotePeerId,
        type: "audio",
        stream: remoteStream,
        track: remoteStream.getAudioTracks()[0],
        isMuted: () => !remoteStream.getAudioTracks()[0]?.enabled,
        mute: async () => {
          if (remoteStream.getAudioTracks()[0])
            remoteStream.getAudioTracks()[0].enabled = false;
        },
        unmute: async () => {
          if (remoteStream.getAudioTracks()[0])
            remoteStream.getAudioTracks()[0].enabled = true;
        },
        dispose: () => {},
      });
      this.broadcastStatus();
    });

    call.on("close", () => this.cleanupPeer(remotePeerId));
    call.on("error", () => this.cleanupPeer(remotePeerId));
  }

  private cleanupPeer(peerId: string) {
    this.audioSinkManager.detach(peerId);
    this.connections.delete(peerId);
    this.remoteStreams.delete(peerId); // E8: Map uses .delete()

    // B11: disconnect analyser source node for this peer
    const source = this.analyserSources.get(peerId);
    if (source) {
      try {
        source.disconnect();
      } catch {
        /* already disconnected */
      }
      this.analyserSources.delete(peerId);
    }

    this.analysers.delete(peerId);
    this.activeSpeakers.delete(peerId);
    this.broadcastStatus();
  }

  private setupAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    this.startSpeakerDetectionLoop();
  }

  private setupLocalSpeakerDetection() {
    if (!this.localStream || !this.audioContext) return;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      // B12: clean up old local analyser/source before creating new one.
      // This method is called from both connect() and setAudioSource(),
      // and each call would leak the previous MediaStreamSourceNode.
      const oldSource = this.analyserSources.get("local");
      if (oldSource) {
        try {
          oldSource.disconnect();
        } catch {
          /* already disconnected */
        }
      }

      const source = this.audioContext.createMediaStreamSource(
        new MediaStream([audioTrack]),
      );
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      this.analysers.set("local", analyser);
      this.analyserSources.set("local", source);
    } catch (err) {
      console.error("[CallClient] Failed to setup local audio analyser", err);
    }
  }

  private startSpeakerDetectionLoop() {
    if (this.speakerDetectionLoopId) return;

    this.speakerDetectionLoopId = setInterval(() => {
      if (this.audioContext?.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      let changed = false;

      this.analysers.forEach((analyser, peerId) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const average = sum / dataArray.length;

        const isSpeaking = average > 10;
        const wasSpeaking = this.activeSpeakers.has(peerId);

        if (isSpeaking && !wasSpeaking) {
          this.activeSpeakers.add(peerId);
          changed = true;
        } else if (!isSpeaking && wasSpeaking) {
          this.activeSpeakers.delete(peerId);
          changed = true;
        }
      });

      if (changed) this.broadcastStatus();
    }, 100);
  }

  private updateCombinedLocalStream(): void {
    if (!this.localStream) return;

    const audioTracks = this.localStream.getAudioTracks();
    const videoTracks = this.localVideoStream?.getVideoTracks() || [];

    // If no real video, use dummy track to keep the sender alive
    if (videoTracks.length === 0) {
      if (!this.dummyVideoTrack) {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, 1, 1);
        }
        const stream = (canvas as any).captureStream(1);
        this.dummyVideoTrack = stream.getVideoTracks()[0];
      }
      if (this.dummyVideoTrack) videoTracks.push(this.dummyVideoTrack);
    }

    if (!this.combinedLocalStream) {
      this.combinedLocalStream = new MediaStream([
        ...audioTracks,
        ...videoTracks,
      ]);
    } else {
      // Sync tracks to the stable instance
      const current = this.combinedLocalStream.getTracks();
      const target = [...audioTracks, ...videoTracks];
      current.forEach((t) => {
        if (!target.includes(t)) this.combinedLocalStream?.removeTrack(t);
      });
      target.forEach((t) => {
        if (!current.includes(t)) this.combinedLocalStream?.addTrack(t);
      });
    }
  }

  private getCombinedLocalStream(): MediaStream | null {
    this.updateCombinedLocalStream();
    return this.combinedLocalStream;
  }

  /**
   * E3: Trigger renegotiation on an RTCPeerConnection after adding a new track.
   * PeerJS doesn't expose a built-in renegotiation API, so we manually
   * create and set the local description. The signaling is handled by PeerJS
   * through its internal data channel.
   */
  private async triggerRenegotiation(pc: RTCPeerConnection): Promise<void> {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
    } catch (err) {
      console.error("[CallClient] Renegotiation failed:", err);
    }
  }

  private broadcastStatus(): void {
    const remoteStreamsByUser: Record<string, MediaStream> = {};
    const activeSpeakersByUser = new Set<string>();
    const screenShareStreamsByUser: Record<string, MediaStream> = {};

    // E8: remoteStreams is now a Map — use .entries()
    for (const [peerId, stream] of this.remoteStreams.entries()) {
      let userId = this.peerToUser.get(peerId);
      // E1: use "-" delimiter for userId extraction fallback
      if (!userId && peerId.includes("-")) {
        userId = peerId.split("-")[0];
      }
      if (userId) remoteStreamsByUser[userId] = stream;
    }

    // Build remote screen share streams by user
    for (const [peerId, call] of this.screenShareConnections.entries()) {
      let userId = this.peerToUser.get(peerId);
      if (!userId && peerId.includes("-")) {
        userId = peerId.split("-")[0];
      }
      if (userId) {
        const stream = this.remoteScreenShareStreams.get(peerId);
        if (stream) screenShareStreamsByUser[userId] = stream;
      }
    }

    for (const peerId of this.activeSpeakers) {
      if (peerId === "local") {
        if (this.target?.userId) activeSpeakersByUser.add(this.target.userId);
        continue;
      }
      let userId = this.peerToUser.get(peerId);
      if (!userId && peerId.includes("-")) {
        userId = peerId.split("-")[0];
      }
      if (userId) activeSpeakersByUser.add(userId);
    }

    const audioTrack = this.localStream?.getAudioTracks()[0];
    const isMuted = audioTrack ? !audioTrack.enabled : true;

    this.callbacks?.onStatusChange({
      participantCount: this.connections.size + 1,
      remoteStreams: remoteStreamsByUser,
      localStream: this.getCombinedLocalStream(),
      activeSpeakers: Array.from(activeSpeakersByUser),
      isScreenSharing: this.isScreenSharing,
      screenShareStream: this.screenShareStream,
      screenShareStreams: screenShareStreamsByUser,
      availableDevices: this.availableDevices,
      selectedAudioDeviceId: this.selectedAudioDeviceId,
      selectedVideoDeviceId: this.selectedVideoDeviceId,
      isMuted,
      isVideoOn: !!this.localVideoStream,
    });
  }

  /** Initiate screen share PeerJS calls to all connected peers */
  private initiateScreenShareCalls(): void {
    if (!this.peer || !this.screenShareStream) return;

    this.connections.forEach((_call, remotePeerId) => {
      this.initiateScreenShareCallToPeer(remotePeerId);
    });
  }

  private initiateScreenShareCallToPeer(remotePeerId: string): void {
    if (!this.peer || !this.screenShareStream) return;
    if (this.screenShareConnections.has(remotePeerId)) return;

    try {
      const screenCall = this.peer.call(remotePeerId, this.screenShareStream, {
        metadata: { type: "screen-share" },
      });
      if (!screenCall) return;

      this.screenShareConnections.set(remotePeerId, screenCall);

      screenCall.on("close", () => {
        this.screenShareConnections.delete(remotePeerId);
      });
      screenCall.on("error", () => {
        this.screenShareConnections.delete(remotePeerId);
      });
    } catch (err) {
      console.error("[CallClient] Failed to send screen share to peer:", err);
    }
  }

  /** Handle an incoming screen share call from a remote peer */
  private handleIncomingScreenShareCall(incomingCall: any): void {
    const remotePeerId = incomingCall.peer;

    // Answer with a silent dummy stream (PeerJS requires a stream for answer)
    const dummyStream = new MediaStream();
    incomingCall.answer(dummyStream);

    incomingCall.on("stream", (remoteScreenStream: MediaStream) => {
      // Store stream in proper Map
      this.remoteScreenShareStreams.set(remotePeerId, remoteScreenStream);
      this.screenShareConnections.set(remotePeerId, incomingCall);
      this.broadcastStatus();

      remoteScreenStream.onremovetrack = () => {
        this.remoteScreenShareStreams.delete(remotePeerId);
        this.screenShareConnections.delete(remotePeerId);
        this.broadcastStatus();
      };
    });

    incomingCall.on("close", () => {
      this.remoteScreenShareStreams.delete(remotePeerId);
      this.screenShareConnections.delete(remotePeerId);
      this.broadcastStatus();
    });
    incomingCall.on("error", () => {
      this.remoteScreenShareStreams.delete(remotePeerId);
      this.screenShareConnections.delete(remotePeerId);
      this.broadcastStatus();
    });
  }
}
