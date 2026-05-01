# Video Call Overlay Design Spec

## Overview
Extend the existing voice call system to include a "Discord-style" Video and Call Overlay. The overlay will cover the central chat area (Top Bar + Messages + Input) of the active room, while preserving the visibility of the Left and Right sidebars. 

## UI/UX & Layout
- **Canvas**: Solid or glassmorphic dark background spanning the central chat column.
- **Participant Grid**: 
  - Responsive grid auto-sizing based on participant count.
  - Video off: Displays user avatar with a pulsing/glowing ring indicating speaking state.
  - Video on: Displays live camera feed.
- **Bottom Control Bar**: Centered, floating pill containing:
  - 🎙️ Mute / Unmute Microphone
  - 📹 Video On / Off
  - 💻 Screen Share (UI placeholder/prep for future implementation)
  - 💬 Back to Chat (Hides overlay, reveals text chat, call remains active)
  - 📞 End Call (Disconnects and hides overlay)

## State Management
- **UI Store (`useUIStore`)**: 
  - Add `isCallOverlayOpen: boolean` (default `false`).
  - Add `setCallOverlayOpen: (isOpen: boolean) => void`.
- **Auto-Open**: Joining a call automatically sets `isCallOverlayOpen(true)`.
- **Persistent Widget**: 
  - Clicking `PersistentCallWidget` routes to the active room (if not already there) and calls `setCallOverlayOpen(true)`.
- **Room Scoping**: 
  - The overlay is strictly bound to the active call's room. If a user navigates to a different room, the overlay is NOT visible (though the call remains active in the background, visible via the PersistentCallWidget).

## Component Architecture
- **`CallOverlay` Component**: 
  - Placed inside `app/portal/room/[room_id]/layout.tsx` (and DM layout if applicable), absolutely positioned within the `.flex-1` chat container.
  - Render Condition: `isCallOverlayOpen === true` AND `useCallStore().actualRoomId === params.room_id`.
- **`ParticipantGrid` & `ParticipantCard`**: Handles dynamic sizing and rendering of media tracks / speaking avatars based on the `CallClient` streams.
- **`CallControls`**: Component for the bottom pill bar.

## Out of Scope
- Actual screen sharing backend/WebRTC logic is excluded from this initial pass (only the UI button is added for layout completeness).
