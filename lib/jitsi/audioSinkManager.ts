import type { JitsiTrack } from "@/lib/jitsi/types";

interface AudioSinkEntry {
  element: HTMLAudioElement;
  track: JitsiTrack;
}

function createAudioElement(trackId: string): HTMLAudioElement {
  const element = document.createElement("audio");
  element.autoplay = true;
  element.setAttribute("playsinline", "true");
  element.dataset.jitsiTrackId = trackId;
  element.style.position = "absolute";
  element.style.width = "0";
  element.style.height = "0";
  element.style.opacity = "0";
  element.style.pointerEvents = "none";
  document.body.appendChild(element);
  return element;
}

export class RemoteAudioSinkManager {
  private readonly entries = new Map<string, AudioSinkEntry>();

  attach(trackId: string, track: JitsiTrack): void {
    const existing = this.entries.get(trackId);
    if (existing) {
      if (existing.track === track) {
        return;
      }
      this.detach(trackId);
    }

    const element = createAudioElement(trackId);
    track.attach(element);
    void element.play().catch(() => undefined);
    this.entries.set(trackId, { element, track });
  }

  detach(trackId: string): void {
    const entry = this.entries.get(trackId);
    if (!entry) {
      return;
    }

    try {
      entry.track.detach(entry.element);
    } catch {
      // Best effort detach.
    }

    entry.element.remove();
    this.entries.delete(trackId);
  }

  clear(): void {
    for (const trackId of this.entries.keys()) {
      this.detach(trackId);
    }
  }
}
