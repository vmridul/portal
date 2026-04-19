"use client";

import type { CallSessionTarget, CallSessionSnapshot } from "@/lib/types/call";
import { RemoteAudioSinkManager } from "./audioSinkManager";
import { CallTrack } from "./types";

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
  private pendingCalls = new Set<string>();
  private lastPeerMappings: { userId: string; peerId: string }[] | null = null;
  private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  async connect(
    target: CallSessionTarget,
    callbacks: PeerCallbacks,
  ): Promise<string> {
    this.target = target;
    this.callbacks = callbacks;
    this.isDisconnecting = false;
    this.isPeerOpen = false;
    this.pendingCalls.clear();
    this.lastPeerMappings = null;

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const { default: Peer } = await import("peerjs");

      // Generate a unique peer ID to avoid collisions on reconnect
      const uniquePeerId = `${target.user.userId}_${Math.random().toString(36).substring(2, 9)}`;

      this.peer = new Peer(uniquePeerId, {
        host: "0.peerjs.com",
        port: 443,
        path: "/",
        secure: true,
        debug: 1, // Increased debug level slightly for better diagnostics
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
      callbacks.onJoined();
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

    this.connections.forEach((conn) => {
      try {
        conn.close();
      } catch (e) {
        // Ignore close errors during disconnect
      }
    });
    this.connections.clear();

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    this.audioSinkManager.clear();
    this.callbacks?.onDisconnected();
    this.isDisconnecting = false;
  }

  async toggleMute(): Promise<boolean> {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled;
    }
    return false;
  }

  public syncParticipants(
    peerMappings: { userId: string; peerId: string }[],
  ): void {
    if (!this.peer || !this.target || !this.localStream) return;

    // Cache the latest mappings so we can sync as soon as the peer opens
    this.lastPeerMappings = peerMappings;

    if (!this.isPeerOpen) {
      return;
    }

    if (this.syncDebounceTimer) clearTimeout(this.syncDebounceTimer);
    this.syncDebounceTimer = setTimeout(() => {
      this.doSyncParticipants(peerMappings);
    }, 1000);
  }

  private doSyncParticipants(
    peerMappings: { userId: string; peerId: string }[],
  ): void {
    if (!this.peer || !this.target || !this.localStream) return;

    const currentUserId = this.target.user.userId;
    if (!currentUserId) return;

    peerMappings.forEach(({ userId, peerId }) => {
      if (userId === currentUserId) return;
      if (this.connections.has(peerId)) return;
      if (this.pendingCalls.has(peerId)) return;

      this.pendingCalls.add(peerId);
      this.initiateCall(peerId);
    });

    this.updateStatus();
  }

  private setupPeerListeners(): void {
    if (!this.peer) return;

    this.peer.on("open", (id) => {
      this.isPeerOpen = true;

      // Automatically sync if we had mappings waiting
      if (this.lastPeerMappings) {
        this.doSyncParticipants(this.lastPeerMappings);
      }
    });

    this.peer.on("disconnected", () => {
      this.isPeerOpen = false;
    });

    this.peer.on("call", (incomingCall) => {
      if (!this.localStream) {
        console.warn("[CallClient] Received call but local stream is missing");
        return;
      }

      incomingCall.answer(this.localStream);
      this.setupCallHandlers(incomingCall);
    });

    this.peer.on("error", (err) => {
      if (err.type === "peer-unavailable") return;
      console.error("[CallClient] Peer error:", err.type, err);
      this.callbacks?.onError(`Call system error: ${err.type}`);
    });
  }

  private initiateCall(remotePeerId: string, retryCount = 0): void {
    if (!this.peer || !this.localStream || this.isDisconnecting) return;

    try {
      const outgoingCall = this.peer.call(remotePeerId, this.localStream);
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
        }
      });
    } catch (error) {
      console.error("[CallClient] Failed to initiate call:", error);
      this.handleCallRetry(remotePeerId, retryCount);
    }
  }

  private handleCallRetry(remotePeerId: string, retryCount: number): void {
    if (this.connections.has(remotePeerId)) return;

    const maxRetries = 3;
    if (retryCount >= maxRetries) {
      this.pendingCalls.delete(remotePeerId);
      return;
    }
    if (!this.peer || this.isDisconnecting) return;

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

    call.on("stream", (remoteStream: MediaStream) => {
      this.pendingCalls.delete(remotePeerId);

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
      this.updateStatus();
    });

    call.on("close", () => {
      this.audioSinkManager.detach(remotePeerId);
      this.connections.delete(remotePeerId);
      this.updateStatus();
    });

    call.on("error", (err: any) => {
      console.error("[CallClient] Call error with:", remotePeerId, err);
      this.audioSinkManager.detach(remotePeerId);
      this.connections.delete(remotePeerId);
      this.updateStatus();
    });
  }

  private updateStatus(): void {
    this.callbacks?.onStatusChange({
      participantCount: this.connections.size + 1,
    });
  }
}
