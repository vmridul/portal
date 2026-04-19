import { CallTrack } from "./types";

interface AudioSinkEntry {
  element: HTMLAudioElement;
  trackId: string;
}

function createAudioElement(trackId: string): HTMLAudioElement {
  const element = document.createElement("audio");
  element.autoplay = true;
  element.setAttribute("playsinline", "true");
  element.setAttribute("controls", "false");
  element.dataset.callTrackId = trackId;
  element.style.position = "absolute";
  element.style.top = "0";
  element.style.left = "-9999px";
  element.style.width = "1px";
  element.style.height = "1px";
  element.style.opacity = "0.01";
  element.style.pointerEvents = "none";
  element.volume = 1;
  (element as any).preservesPitch = false;
  element.muted = false;
  document.body.appendChild(element);
  return element;
}

export class RemoteAudioSinkManager {
  private readonly entries = new Map<string, AudioSinkEntry>();

  attach(track: CallTrack): void {
    const trackId = track.id;
    
    const existing = this.entries.get(trackId);
    if (existing) return;

    const element = createAudioElement(trackId);
    
    if (track.stream) {
      element.srcObject = track.stream;
    }

    element.play().catch((err) => {
      if (err.name === "NotAllowedError") {
        const resumeAudio = () => {
          element.play().catch(() => undefined);
          document.removeEventListener("click", resumeAudio);
        };
        document.addEventListener("click", resumeAudio);
      }
    });

    this.entries.set(trackId, { element, trackId });
  }

  detach(trackId: string): void {
    const entry = this.entries.get(trackId);
    if (!entry) return;

    entry.element.srcObject = null;
    entry.element.pause();
    entry.element.remove();
    this.entries.delete(trackId);
  }

  clear(): void {
    for (const trackId of Array.from(this.entries.keys())) {
      this.detach(trackId);
    }
  }
}