# Jitsi Voice Calling Integration Design

**Created:** 2026-04-18  
**Status:** Approved

---

## 1. Overview

Integrate Jitsi Meet (via lib-jitsi-meet SDK) for real voice calls. Audio-only, supports group calls, uses free meet.jit.si service.

---

## 2. Requirements

- **Call Type:** Audio only (no video)
- **Participants:** Group calls (multiple users)
- **Integration:** SDK for custom UI control
- **Service:** meet.jit.si (free hosted)

---

## 3. Architecture

### 3.1 Component Structure

```
hooks/
└── useJitsi.ts              # Jitsi API wrapper hook

components/
└── shared/
    └── sidebar/
        └── JitsiProvider.tsx    # Wraps Jitsi connection
```

### 3.2 Data Flow

```
User clicks "Start Call" / "Join Call"
         │
         ▼
useJitsi connects to meet.jit.si/{roomId}
         │
         ▼
Jitsi handles audio streaming
         │
         ▼
Sidebar controls (mute/leave) via useJitsi
```

---

## 4. Integration

### 4.1 Dependencies

```bash
npm install @jitsi/lib-jitsi-meet
```

### 4.2 useJitsi Hook API

```typescript
interface UseJitsiReturn {
  isJoined: boolean;
  isMuted: boolean;
  join: (roomId: string) => Promise<void>;
  leave: () => void;
  toggleMute: () => void;
  dispose: () => void;
}
```

### 4.3 JitsiProvider

- Wraps JItsi connection
- Handles audio-only config
- Exposes controls to parent

---

## 5. Configuration

```javascript
const config = {
  serviceUrl: 'https://meet.jit.si',
  hosts: {
    domain: 'meet.jit.si',
    muc: 'conference.meet.jit.si',
    focus: 'focus.meet.jit.si',
  },
  configOverwrite: {
    startWithAudioMuted: false,
    startWithVideoMuted: true,
    disableThirdPartyRequests: true,
    prejoinPageEnabled: false,
  },
};
```

---

## 6. UI Integration

### ActiveCallPanel updates:
- "Join Call" → calls `jitsi.join(roomId)`
- "Mute" → calls `jitsi.toggleMute()`
- "Leave" → calls `jitsi.leave()`

---

## 7. Acceptance Criteria

1. ✅ User can start a call → opens Jitsi connection
2. ✅ Other users see call → can join same room
3. ✅ Mute button works → mutes Jitsi audio
4. ✅ Leave button works → leaves Jitsi room
5. ✅ Multiple users can join same call
6. ✅ Audio-only (no video UI)