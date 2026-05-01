# WebRTC Video & Active Speaker Detection Design Spec

## Overview
Enhance the existing PeerJS `CallClient` to support dynamic video toggling (turning cameras on/off without dropping the audio connection) and native Web Audio API-based active speaker detection to power the Call Overlay UI.

## Video Toggling Architecture
- **State**: Add `isVideoOn: boolean` to `useCallStore`. `CallClient` maintains `localVideoStream: MediaStream | null`. Video is OFF by default.
- **Toggle ON**: 
  - Call `getUserMedia({ video: true })` and save to `localVideoStream`.
  - Iterate through all active PeerJS connections in `this.connections`.
  - For each connection, access the underlying `peerConnection.getSenders()`.
  - Find the video sender (or add a new track if none exists) and call `replaceTrack(newVideoTrack)`.
- **Toggle OFF**: 
  - Stop the tracks in `localVideoStream`.
  - Iterate through `connections` and remove or replace the video track with null.

## Active Speaker Detection (Native Web Audio API)
- **AudioContext**: Initialize a shared `AudioContext` in `CallClient`.
- **Node Setup**: When receiving a `remoteStream`, create a `MediaStreamAudioSourceNode` connected to an `AnalyserNode` for that stream.
- **Monitoring Loop**: Use `setInterval` (~100ms) to read frequency data (`getByteFrequencyData`) from the `AnalyserNode`.
- **Thresholding**: Calculate the average volume level. If it exceeds a defined threshold, the participant is considered speaking.
- **State Integration**: Dispatch the speaking status to `useCallStore`, maintaining an `activeSpeakers: Set<string>` (or similar data structure).

## UI Integration
- **`CallControls`**: Connect the "Turn On Camera" button to `toggleVideo()` from the store. Updates icon state based on `isVideoOn`.
- **`ParticipantGrid`**: Pull the remote streams and `activeSpeakers` list from the store.
- **`ParticipantCard`**: Receive the `MediaStream` and `isSpeaking` props to accurately render the `<video>` element or the glowing avatar ring.

## Out of Scope
- Screen sharing logic is deferred to a future iteration. Only camera video is handled in this spec.
