# Calls Sidebar Design Specification

**Created:** 2026-04-18  
**Status:** Approved

---

## 1. Overview

Add a calls sidebar to the chat application that displays ongoing and recent calls. Users can start, join, and leave group audio calls directly from the sidebar.

## 2. Requirements

- **Call Type:** Audio only (voice calls)
- **Participants:** Group/conference calls (multiple users can join)
- **Display:** Active call on top, recent calls below
- **Persistence:** Call history stored in Convex

---

## 3. Architecture

### 3.1 Component Structure

```
components/
├── shared/
│   └── sidebar/
│       ├── CallSidebar.tsx       # Main container
│       ├── ActiveCallPanel.tsx     # Ongoing call display
│       └── RecentCallsList.tsx   # Call history
├── layout/
│   └── TopBar.tsx                # Add call button
store/
└── uiStore.tsx                  # Add calls tab
```

### 3.2 Convex Schema

```typescript
// Table: calls
{
  _id: Id<"calls">,
  roomId: string,
  startedAt: number,
  endedAt?: number,
  participants: string[],  // user IDs
  initiatorId: string,
  isActive: boolean,
}
```

---

## 4. UI/UX Specification

### 4.1 Call Button (TopBar)

- Icon: `Phone` from Lucide React
- Position: Next to Media and Info buttons
- Badge: Green dot when active call exists

### 4.2 Call Sidebar (320px width)

**Section A: Active Call Panel (when call is active)**
- Room name with call icon
- Participant count
- Participant list with avatars + names
- Mute/unmute toggle button
- Leave call button (red)
- Call duration timer (MM:SS format)

**Section B: Recent Calls List**
- Grouped by date: Today, Yesterday, This Week, Earlier
- Each item shows:
  - Participant avatars (up to 3, then +N)
  - Call type icon (audio)
  - Duration (e.g., "5:32")
  - Timestamp (e.g., "2:30 PM")
- "Start new call" button at bottom

### 4.3 Interactions

- Click call button → Open calls sidebar
- Click participant → Open DM with user
- Click recent call → Start new call with those participants
- Click mute → Toggle microphone
- Click leave → Leave the call

---

## 5. API Functions

| Function | Description |
|----------|-------------|
| `startCall(roomId)` | Create new call, set initiator as first participant |
| `joinCall(callId)` | Add current user to call participants |
| `leaveCall(callId)` | Remove current user; end call if no participants left |
| `endCall(callId)` | Force end call for all participants |
| `getRecentCalls(roomId, limit)` | Fetch call history for a room |
| `getActiveCall(roomId)` | Get currently active call for a room |

---

## 6. State Management

### UI Store Updates

```typescript
interface UIState {
  // Existing fields...
  sidebarTab: "info" | "media" | "calls";
  activeCall: {
    callId: string;
    isMuted: boolean;
  } | null;
}
```

---

## 7. Real-time Features

- Use Convex reactive queries for:
  - Active call updates (participants joining/leaving)
  - Call duration timer
  - Recent calls list updates

---

## 8. Acceptance Criteria

1. ✅ Call button visible in TopBar
2. ✅ Clicking button opens calls sidebar
3. ✅ Active call shows at top with all participants
4. ✅ Can mute/unmute during call
5. ✅ Can leave call
6. ✅ Recent calls listed below active call
7. ✅ Can start new call from sidebar
8. ✅ Call history persists in Convex
9. ✅ Real-time updates work (join/leave reflects immediately)